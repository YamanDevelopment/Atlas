import { GoogleGenAI, Type } from '@google/genai';
import type { IWeightedTag } from '../database/schemas/Event';
import config from '../../../config';
import { getPrimaryTags, getSecondaryTags } from '../database/services/defaults';

interface GeminiAnalysisResult {
	tags: IWeightedTag[];
	confidence: number;
	modelUsed: string;
}

interface ContentAnalysisRequest {
	title: string;
	description: string;
	additionalContext?: {
		department?: string;
		location?: string;
		contactInfo?: string;
		researchAreas?: string[];
		eventType?: string;
	};
}

interface InterestAnalysisRequest {
	interestKeyword: string;
	userDescription?: string; // Optional detailed description from user
	userContext?: {
		major?: string;
		year?: string;
		previousInterests?: string[];
		goals?: string;
	};
}

interface InterestAnalysisResult {
	tags: IWeightedTag[];
	confidence: number;
	modelUsed: string;
	suggestedInterestName?: string; // Refined interest name
}

export class GeminiService {
	private genAI: GoogleGenAI;

	constructor() {
		if (!config.ai.gemini.apiKey) {
			throw new Error('GEMINI_API_KEY is required in configuration');
		}

		this.genAI = new GoogleGenAI({
			apiKey: config.ai.gemini.apiKey,
		});

		console.log(`GeminiService initialized with model: ${config.ai.gemini.model}`);
	}

	/**
	 * Build tag mapping with actual IDs from defaults.ts
	 * This matches the sequential ID assignment in initializer.ts
	 */
	private buildTagMapping(): { primaryTags: Map<string, number>; secondaryTags: Map<string, { id: number; parentName: string; parentId: number }> } {
		const primaryTags = new Map<string, number>();
		const secondaryTags = new Map<string, { id: number; parentName: string; parentId: number }>();

		// Get actual tags from defaults.ts
		const primaryTagList = getPrimaryTags();
		const secondaryTagList = getSecondaryTags();

		// Primary tags: IDs 1-13 (matches initializer.ts logic)
		primaryTagList.forEach((tag, index) => {
			primaryTags.set(tag.name, index + 1);
		});

		// Secondary tags: IDs 14+ (matches initializer.ts logic)
		let secondaryId = primaryTagList.length + 1;
		secondaryTagList.forEach(tag => {
			const parentId = primaryTags.get(tag.parentTag || '') || 0;
			secondaryTags.set(tag.name, {
				id: secondaryId,
				parentName: tag.parentTag || '',
				parentId,
			});
			secondaryId++;
		});

		return { primaryTags, secondaryTags };
	}

	/**
	 * Extract retry delay from API error response
	 */
	private extractRetryDelay(error: any): number | null {
		try {
			// Try to extract from error message or details
			if (error.message && typeof error.message === 'string') {
				const match = error.message.match(/retry in (\d+(?:\.\d+)?)[s]?\./);
				if (match) {
					return parseFloat(match[1]);
				}
			}

			// Try to extract from error details (Google API format)
			if (error.error?.details) {
				for (const detail of error.error.details) {
					if (detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo' && detail.retryDelay) {
						// Parse duration string like "27s"
						const retryDelay = detail.retryDelay;
						if (typeof retryDelay === 'string') {
							const seconds = parseInt(retryDelay.replace(/[^0-9]/g, ''));
							return isNaN(seconds) ? null : seconds;
						}
					}
				}
			}

			return null;
		} catch {
			return null;
		}
	}

	/**
	 * Analyze content and return weighted hierarchical tags with intelligent retry logic
	 * Implements two-phase weighting as specified
	 */
	async analyzeContent(content: ContentAnalysisRequest, retryCount: number = 0): Promise<GeminiAnalysisResult> {
		const maxRetries = 3;
		try {
			const prompt = this.buildAnalysisPrompt(content);

			const response = await this.genAI.models.generateContent({
				model: config.ai.gemini.model,
				contents: prompt,
				config: {
					responseMimeType: 'application/json',
					responseSchema: {
						type: Type.OBJECT,
						properties: {
							tags: {
								type: Type.ARRAY,
								items: {
									type: Type.OBJECT,
									properties: {
										tagId: { type: Type.NUMBER },
										weight: { type: Type.NUMBER },
										category: { type: Type.STRING },
										parentTagId: { type: Type.NUMBER },
									},
									required: ['tagId', 'weight', 'category'],
								},
							},
							overallConfidence: { type: Type.NUMBER },
						},
						required: ['tags', 'overallConfidence'],
					},
					maxOutputTokens: config.ai.gemini.maxTokens,
					temperature: config.ai.gemini.temperature,
				},
			});

			console.log('Raw Gemini response:', response.text);

			// Handle empty or invalid responses
			if (!response.text || response.text.trim() === '') {
				console.log('Empty response from Gemini, retrying...');
				throw new Error('Empty response from Gemini API');
			}

			let analysisResult;
			try {
				analysisResult = JSON.parse(response.text);
			} catch (parseError) {
				console.error('JSON parse failed, raw response:', response.text);
				throw new Error(`Invalid JSON response from Gemini: ${parseError}`);
			}

			// Validate the analysis results
			if (!analysisResult.tags || !Array.isArray(analysisResult.tags)) {
				console.error('Invalid analysis result structure:', analysisResult);
				throw new Error('Invalid response format: tags array is required');
			}

			// Validate and filter out invalid tag IDs
			const { primaryTags, secondaryTags } = this.buildTagMapping();
			const maxValidTagId = primaryTags.size + secondaryTags.size;

			const validTags = analysisResult.tags.filter((tag: any) => {
				// Check for valid integer tag ID
				if (!Number.isInteger(tag.tagId) || tag.tagId < 1 || tag.tagId > maxValidTagId) {
					console.warn(`🚨 Rejecting invalid tag ID: ${tag.tagId} (must be integer 1-${maxValidTagId})`);
					return false;
				}

				// Check for valid weight
				if (typeof tag.weight !== 'number' || tag.weight < 0 || tag.weight > 1) {
					console.warn(`🚨 Rejecting invalid weight: ${tag.weight} for tag ${tag.tagId}`);
					return false;
				}

				// Check for valid category
				if (!['primary', 'secondary'].includes(tag.category)) {
					console.warn(`🚨 Rejecting invalid category: ${tag.category} for tag ${tag.tagId}`);
					return false;
				}

				return true;
			});

			console.log(`✅ Content analysis validated ${validTags.length}/${analysisResult.tags.length} tags`);

			// CRITICAL: Ensure at least one tag is assigned (mandatory requirement)
			if (validTags.length === 0) {
				console.error(`🚨 CRITICAL: No valid tags found for content "${content.title.substring(0, 50)}..."`);
				console.error('Assigning default "general" tag to prevent empty tag array');

				// Assign a default general tag (assuming ID 1 is a general category)
				validTags.push({
					tagId: 1, // Assuming first primary tag is general
					weight: 0.3,
					category: 'primary',
					reasoning: 'Default assignment - no valid tags detected',
				});
			}

			// Enforce maximum tags limit from config
			if (validTags.length !== analysisResult.tags.length) {
				console.warn(`⚠️ Filtered out ${analysisResult.tags.length - validTags.length} invalid tags`);
			}

			// Enforce maximum tags limit from config using validated tags
			const limitedTags = validTags.slice(0, config.ai.tagging.maxTagsPerItem);

			// Filter out tags below confidence threshold
			const filteredTags = limitedTags.filter((tag: any) =>
				tag.weight >= config.ai.tagging.confidenceThreshold,
			);

			return {
				tags: filteredTags,
				confidence: analysisResult.overallConfidence || 0.8,
				modelUsed: config.ai.gemini.model,
			};
		} catch (error: any) {
			console.error('Gemini analysis error:', error);

			// Handle rate limiting with exponential backoff
			if (error.status === 429 && retryCount < maxRetries) {
				// Extract retry delay from error if available
				const retryDelaySeconds = this.extractRetryDelay(error) || Math.pow(2, retryCount) * 30;
				console.log(`Rate limited. Retrying in ${retryDelaySeconds} seconds... (attempt ${retryCount + 1}/${maxRetries})`);

				await new Promise(resolve => setTimeout(resolve, retryDelaySeconds * 1000));
				return this.analyzeContent(content, retryCount + 1);
			}

			throw new Error(`Failed to analyze content with Gemini: ${error}`);
		}
	}

	/**
	 * Analyze individual user interest and return weighted hierarchical tags
	 * Implements two-phase weighting for interest categorization
	 */
	async analyzeInterest(interest: InterestAnalysisRequest): Promise<InterestAnalysisResult> {
		try {
			const prompt = this.buildInterestAnalysisPrompt(interest);

			const response = await this.genAI.models.generateContent({
				model: config.ai.gemini.model,
				contents: prompt,
				config: {
					responseMimeType: 'application/json',
					responseSchema: {
						type: Type.OBJECT,
						properties: {
							tags: {
								type: Type.ARRAY,
								items: {
									type: Type.OBJECT,
									properties: {
										tagId: { type: Type.NUMBER },
										weight: { type: Type.NUMBER },
										category: { type: Type.STRING },
										parentTagId: { type: Type.NUMBER },
									},
									required: ['tagId', 'weight', 'category'],
								},
							},
							overallConfidence: { type: Type.NUMBER },
							suggestedInterestName: { type: Type.STRING },
						},
						required: ['tags', 'overallConfidence'],
					},
					maxOutputTokens: config.ai.gemini.maxTokens,
					temperature: config.ai.gemini.temperature,
				},
			});

			console.log('Raw Gemini interest response:', response.text);

			// Handle empty or invalid responses
			if (!response.text || response.text.trim() === '') {
				console.log('Empty response from Gemini for interest analysis, retrying...');
				throw new Error('Empty response from Gemini API');
			}

			let analysisResult;
			try {
				analysisResult = JSON.parse(response.text);
			} catch (parseError) {
				console.error('JSON parse failed for interest analysis, raw response:', response.text);
				throw new Error(`Invalid JSON response from Gemini: ${parseError}`);
			}

			// Validate the analysis results
			if (!analysisResult.tags || !Array.isArray(analysisResult.tags)) {
				console.error('Invalid interest analysis result structure:', analysisResult);
				throw new Error('Invalid response format: tags array is required');
			}

			// Validate and filter out invalid tag IDs for interests
			const { primaryTags, secondaryTags } = this.buildTagMapping();
			const maxValidTagId = primaryTags.size + secondaryTags.size;

			const validTags = analysisResult.tags.filter((tag: any) => {
				// Check for valid integer tag ID
				if (!Number.isInteger(tag.tagId) || tag.tagId < 1 || tag.tagId > maxValidTagId) {
					console.warn(`🚨 Interest analysis - rejecting invalid tag ID: ${tag.tagId}`);
					return false;
				}

				// Check for valid weight and category
				if (typeof tag.weight !== 'number' || tag.weight < 0 || tag.weight > 1) {
					console.warn(`🚨 Interest analysis - rejecting invalid weight: ${tag.weight}`);
					return false;
				}

				if (!['primary', 'secondary'].includes(tag.category)) {
					console.warn(`🚨 Interest analysis - rejecting invalid category: ${tag.category}`);
					return false;
				}

				return true;
			});

			console.log(`✅ Interest analysis validated ${validTags.length}/${analysisResult.tags.length} tags`);

			// CRITICAL: Ensure at least one tag is assigned (mandatory requirement)
			if (validTags.length === 0) {
				console.error(`🚨 CRITICAL: No valid tags found for interest "${interest.interestKeyword}"`);
				console.error('Assigning default "general" tag to prevent empty tag array');

				// Assign a default general tag (assuming ID 1 is a general category)
				validTags.push({
					tagId: 1, // Assuming first primary tag is general
					weight: 0.3,
					category: 'primary',
				});
			}

			// Enforce maximum tags limit from config (allow slightly more for interests)
			const maxInterestTags = Math.min(config.ai.tagging.maxTagsPerItem + 2, 7);
			const limitedTags = validTags.slice(0, maxInterestTags);

			// Filter out tags below confidence threshold
			const filteredTags = limitedTags.filter((tag: any) =>
				tag.weight >= config.ai.tagging.confidenceThreshold,
			);

			return {
				tags: filteredTags,
				confidence: analysisResult.overallConfidence || 0.8,
				modelUsed: config.ai.gemini.model,
				suggestedInterestName: analysisResult.suggestedInterestName || interest.interestKeyword,
			};
		} catch (error) {
			console.error('Gemini interest analysis error:', error);
			throw new Error(`Failed to analyze interest with Gemini: ${error}`);
		}
	}

	private buildInterestAnalysisPrompt(interest: InterestAnalysisRequest): string {
		const contextInfo = interest.userContext ?
			`User context: ${JSON.stringify(interest.userContext)}` : '';
		const descriptionInfo = interest.userDescription ?
			`Detailed description: "${interest.userDescription}"` : '';

		const { primaryTags, secondaryTags } = this.buildTagMapping();

		// Build COMPLETE primary tags list with exact IDs
		const primaryCategoriesList = Array.from(primaryTags.entries())
			.map(([name, id]) => `${id}. ${name.charAt(0).toUpperCase() + name.slice(1)} (ID: ${id})`)
			.join('\n');

		// Build COMPLETE secondary tags list with exact IDs and parent relationships
		const allSecondaryTagsList = Array.from(secondaryTags.entries())
			.map(([name, data]) => `${data.id}. ${name.charAt(0).toUpperCase() + name.slice(1)} (ID: ${data.id}, Parent: ${data.parentName}, ParentID: ${data.parentId})`)
			.join('\n');

		return `
You are an expert AI that analyzes user interests using ONLY the predefined university tag system below.

CRITICAL RULES:
- MANDATORY: Assign at least 1 tag (never return empty tags array)
- Recommended: Find 2-7 most relevant tags for comprehensive analysis
- ONLY use tag IDs from the lists below
- NEVER create new tag IDs or use decimals (8.1, 7.1, etc.)
- NEVER use tag IDs above ${primaryTags.size + secondaryTags.size}
- PRIORITIZE analysis of the INTEREST KEYWORD and DESCRIPTION as they contain the key information
- For secondary tags, ALWAYS use the exact parentTagId from the list

=== ALL PRIMARY TAGS (IDs 1-${primaryTags.size}) ===
${primaryCategoriesList}

=== ALL SECONDARY TAGS (IDs ${primaryTags.size + 1}-${primaryTags.size + secondaryTags.size}) ===
${allSecondaryTagsList}

INTEREST TO ANALYZE:
Interest Keyword: "${interest.interestKeyword}"
${descriptionInfo}
${contextInfo}

ANALYSIS PROCESS:
1. **CAREFULLY analyze the INTEREST KEYWORD** - this is the primary indicator of what the user cares about
2. **REVIEW the detailed description** if provided - contains important context and specifics
3. Consider user context if provided
4. Find 1-7 most relevant tags from the EXACT lists above (at least 1 is mandatory)
5. Assign weights (0-1) based on how strongly the interest keyword/description matches the tag
6. For secondary tags, use the EXACT parentTagId from the list

RESPONSE FORMAT (JSON):
{
  "tags": [
    {
      "tagId": [USE EXACT ID FROM LISTS ABOVE],
      "weight": [0.0-1.0],
      "category": "primary" or "secondary",
      "parentTagId": [ONLY for secondary tags - use exact ID from parent list]
    }
  ],
  "overallConfidence": [0.0-1.0],
  "suggestedInterestName": "[refined interest name]"
}

STRICT REQUIREMENTS:
- **MUST assign at least 1 tag (this is mandatory)**
- tagId MUST be an integer from the lists above
- category MUST be "primary" or "secondary"
- parentTagId ONLY for secondary tags, using exact parent ID
- NO decimal tag IDs (8.1, 7.1, etc.)
- NO made-up tag IDs above ${primaryTags.size + secondaryTags.size}
- Focus on relevance to university activities and student interests
`;
	}

	private buildAnalysisPrompt(content: ContentAnalysisRequest): string {
		const contextInfo = content.additionalContext ?
			`Additional context: ${JSON.stringify(content.additionalContext)}` : '';

		const { primaryTags, secondaryTags } = this.buildTagMapping();

		// Build COMPLETE primary tags list with exact IDs
		const primaryCategoriesList = Array.from(primaryTags.entries())
			.map(([name, id]) => `${id}. ${name.charAt(0).toUpperCase() + name.slice(1)} (ID: ${id})`)
			.join('\n');

		// Build COMPLETE secondary tags list with exact IDs and parent relationships
		const allSecondaryTagsList = Array.from(secondaryTags.entries())
			.map(([name, data]) => `${data.id}. ${name.charAt(0).toUpperCase() + name.slice(1)} (ID: ${data.id}, Parent: ${data.parentName}, ParentID: ${data.parentId})`)
			.join('\n');

		return `
You are an expert AI that categorizes university content using ONLY the predefined tag system below.

CRITICAL RULES:
- MANDATORY: Assign at least 1 tag (never return empty tags array)
- Maximum: ${config.ai.tagging.maxTagsPerItem} tags per item
- ONLY use tag IDs from the lists below
- NEVER create new tag IDs or use decimals (8.1, 7.1, etc.)  
- NEVER use tag IDs above ${primaryTags.size + secondaryTags.size}
- PRIORITIZE analysis of TITLE and DESCRIPTION as they contain the most important information
- For secondary tags, ALWAYS use the exact parentTagId from the list

=== ALL PRIMARY TAGS (IDs 1-${primaryTags.size}) ===
${primaryCategoriesList}

=== ALL SECONDARY TAGS (IDs ${primaryTags.size + 1}-${primaryTags.size + secondaryTags.size}) ===
${allSecondaryTagsList}

CONTENT TO ANALYZE:
Title: "${content.title}"
Description: "${content.description}"
${contextInfo}

ANALYSIS PROCESS:
1. **CAREFULLY read the TITLE** - this often indicates the primary purpose/topic
2. **THOROUGHLY analyze the DESCRIPTION** - this contains key themes and details
3. Consider additional context if provided
4. Find 1-${config.ai.tagging.maxTagsPerItem} most relevant tags from the EXACT lists above
5. Assign weights (0-1) based on how well the title/description matches the tag
6. For secondary tags, use the EXACT parentTagId from the list

RESPONSE FORMAT (JSON):
{
  "tags": [
    {
      "tagId": [USE EXACT ID FROM LISTS ABOVE],
      "weight": [0.0-1.0],
      "category": "primary" or "secondary",
      "parentTagId": [ONLY for secondary tags - use exact ID from parent list]
    }
  ],
  "overallConfidence": [0.0-1.0]
}

STRICT REQUIREMENTS:
- **MUST assign at least 1 tag (this is mandatory)**
- tagId MUST be an integer from the lists above
- category MUST be "primary" or "secondary" 
- parentTagId ONLY for secondary tags, using exact parent ID
- NO decimal tag IDs (8.1, 7.1, etc.)
- Base your analysis primarily on the title and description content
`;
	}

	/**
	 * Batch analyze multiple content items with aggressive rate limiting for Tier 1
	 * Tier 1: 4,000 RPM, 4M TPM - can handle much larger batches!
	 */
	async batchAnalyze(contentItems: ContentAnalysisRequest[]): Promise<GeminiAnalysisResult[]> {
		const results: GeminiAnalysisResult[] = [];

		// Tier 1: 4000 requests per minute = ~67 requests per second
		// ULTRA AGGRESSIVE: Use batch size of 50 with 50ms delays for 10x speedup!
		const batchSize = 50; // 10x more aggressive batching
		const delayBetweenBatches = 50; // Minimal delay for MAXIMUM SPEED

		console.log('🚀🚀🚀 ULTRA AGGRESSIVE Tier 1 batching - FULL THROTTLE MODE!');
		console.log(`📊 Processing ${contentItems.length} items in MEGA batches of ${batchSize}`);
		console.log(`⚡ Estimated completion: ~${Math.ceil(contentItems.length / batchSize * delayBetweenBatches / 1000)} seconds`);

		for (let i = 0; i < contentItems.length; i += batchSize) {
			const batch = contentItems.slice(i, i + batchSize);
			const batchNum = Math.floor(i / batchSize) + 1;
			const totalBatches = Math.ceil(contentItems.length / batchSize);

			console.log(`� Processing MEGA batch ${batchNum}/${totalBatches} (${batch.length} items)`);

			// Process entire batch in parallel - MAXIMUM THROUGHPUT
			const batchPromises = batch.map(async (content, index) => {
				try {
					// Minimal stagger to avoid exact same timestamp
					if (index > 0) {
						await new Promise(resolve => setTimeout(resolve, index * 2)); // Only 2ms stagger!
					}
					return await this.analyzeContent(content);
				} catch (error: any) {
					console.error(`❌ Failed "${content.title.substring(0, 30)}":`, error?.message?.substring(0, 100) || error);
					return null;
				}
			});

			try {
				const batchResults = await Promise.all(batchPromises);
				// Filter out null results from failed analyses
				const successfulResults = batchResults.filter((result): result is GeminiAnalysisResult => result !== null);
				results.push(...successfulResults);

				console.log(`🎯 MEGA batch ${batchNum} completed: ${successfulResults.length}/${batch.length} successful (${Math.round(successfulResults.length / batch.length * 100)}%)`);
			} catch (error) {
				console.error(`💥 MEGA batch ${batchNum} failed:`, error);
				// Continue with next batch rather than failing entirely
			}

			// Short delay between batches to respect rate limits
			if (i + batchSize < contentItems.length) {
				await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
			}
		}

		console.log(`🚀 ULTRA FAST batch analysis complete: ${results.length}/${contentItems.length} items processed`);
		console.log(`📈 Success rate: ${Math.round((results.length / contentItems.length) * 100)}%`);
		return results;
	}

	/**
	 * Batch analyze multiple user interests with Tier 1 optimization
	 */
	async batchAnalyzeInterests(interests: InterestAnalysisRequest[]): Promise<InterestAnalysisResult[]> {
		const results: InterestAnalysisResult[] = [];

		// Use same aggressive batching for interests
		const batchSize = 10; // Slightly smaller for interests (more complex analysis)
		const delayBetweenBatches = 250; // Slightly more conservative

		console.log('🎯 Processing interests with Tier 1 optimization');
		console.log(`📊 Processing ${interests.length} interests in batches of ${batchSize}`);

		for (let i = 0; i < interests.length; i += batchSize) {
			const batch = interests.slice(i, i + batchSize);
			const batchNum = Math.floor(i / batchSize) + 1;
			const totalBatches = Math.ceil(interests.length / batchSize);

			console.log(`🔄 Processing interest batch ${batchNum}/${totalBatches} (${batch.length} items)`);

			const batchPromises = batch.map(async (interest, index) => {
				try {
					// Small stagger within batch
					if (index > 0) {
						await new Promise(resolve => setTimeout(resolve, index * 25));
					}
					return await this.analyzeInterest(interest);
				} catch (error: any) {
					console.error(`❌ Failed to analyze interest "${interest.interestKeyword}":`, error?.message || error);
					return null; // Return null for failed items
				}
			});

			try {
				const batchResults = await Promise.all(batchPromises);
				// Filter out null results from failed analyses
				const successfulResults = batchResults.filter((result): result is InterestAnalysisResult => result !== null);
				results.push(...successfulResults);

				console.log(`✅ Interest batch ${batchNum} completed: ${successfulResults.length}/${batch.length} successful`);
			} catch (error) {
				console.error(`❌ Interest batch ${batchNum} processing failed:`, error);
				// Continue with next batch rather than failing entirely
			}

			// Rate limiting delay between batches
			if (i + batchSize < interests.length) {
				await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
			}
		}

		console.log(`🎯 Interest batch analysis complete: ${results.length}/${interests.length} items processed successfully`);
		return results;
	}

	/**
	 * Get analysis statistics for monitoring
	 */
	getModelInfo(): { model: string; version: string } {
		return {
			model: config.ai.gemini.model,
			version: '2.5',
		};
	}

	/**
	 * Generate involvement guide for labs/orgs when student clicks "get involved"
	 */
	async generateInvolvementGuide(item: { name: string; description: string; website?: string }, userInterests: string[]): Promise<{
		guide: string;
		actionableSteps: string[];
		tips: string[];
		confidence: number;
	}> {
		try {
			const prompt = this.buildInvolvementGuidePrompt(item, userInterests);

			const response = await this.genAI.models.generateContent({
				model: config.ai.gemini.model,
				contents: prompt,
				config: {
					responseMimeType: 'application/json',
					responseSchema: {
						type: Type.OBJECT,
						properties: {
							guide: { type: Type.STRING },
							actionableSteps: {
								type: Type.ARRAY,
								items: { type: Type.STRING },
							},
							tips: {
								type: Type.ARRAY,
								items: { type: Type.STRING },
							},
							confidence: { type: Type.NUMBER },
						},
						required: ['guide', 'actionableSteps', 'tips', 'confidence'],
					},
					maxOutputTokens: config.ai.gemini.maxTokens,
					temperature: 0.7, // Slightly more creative for advice
				},
			});

			if (!response.text || response.text.trim() === '') {
				throw new Error('Empty response from Gemini API for involvement guide');
			}

			const result = JSON.parse(response.text);

			return {
				guide: result.guide || 'Visit the organization link to learn more about getting involved.',
				actionableSteps: result.actionableSteps || ['Contact the organization directly'],
				tips: result.tips || ['Check their website for more details'],
				confidence: result.confidence || 0.5,
			};

		} catch (error) {
			console.error('Gemini involvement guide error:', error);
			return {
				guide: item.website
					? `Visit ${item.website} to learn more about getting involved with ${item.name}.`
					: `Contact ${item.name} directly to learn more about getting involved.`,
				actionableSteps: ['Contact the organization directly for more information'],
				tips: ['Check their website or social media for updates'],
				confidence: 0.3,
			};
		}
	}

	/**
	 * Build involvement guide prompt
	 */
	private buildInvolvementGuidePrompt(item: { name: string; description: string; website?: string }, userInterests: string[]): string {
		return `
You are an AI assistant helping students get involved in university organizations and labs.

ORGANIZATION/LAB DETAILS:
Name: ${item.name}
Description: ${item.description}
${item.website ? `Website: ${item.website}` : ''}

STUDENT'S INTERESTS: ${userInterests.join(', ')}

Create a practical involvement guide with actionable advice. If the description is too vague or provides insufficient detail, suggest they visit the link/contact for more information.

RESPONSE FORMAT (JSON):
{
  "guide": "2-3 sentence overview of how to get involved effectively",
  "actionableSteps": [
    "Specific step 1",
    "Specific step 2", 
    "Specific step 3"
  ],
  "tips": [
    "Helpful tip 1",
    "Helpful tip 2",
    "Helpful tip 3"
  ],
  "confidence": 0.8
}

Focus on:
- Practical first steps for getting involved
- Ways to contribute based on student interests
- Tips for being successful in the organization
- How to make meaningful connections
- If description lacks detail, recommend visiting their website/contacting directly
`;
	}

	/**
	 * Generate involvement plan for new students based on their interests and available opportunities
	 */
	async generateInvolvementPlan(
		userInterests: string[],
		recommendedOpportunities: { type: 'lab' | 'org' | 'event'; item: any; score: number }[],
		professors: { name: string; email: string; researchAreas: string[]; labs: string[] }[],
	): Promise<{
		plan: string;
		prioritizedSteps: string[];
		professorRecommendations: { name: string; email: string; reason: string }[];
		timeline: { phase: string; activities: string[]; duration: string }[];
	}> {
		try {
			const prompt = this.buildInvolvementPlanPrompt(userInterests, recommendedOpportunities, professors);

			const response = await this.genAI.models.generateContent({
				model: config.ai.gemini.model,
				contents: prompt,
				config: {
					responseMimeType: 'application/json',
					responseSchema: {
						type: Type.OBJECT,
						properties: {
							plan: { type: Type.STRING },
							prioritizedSteps: {
								type: Type.ARRAY,
								items: { type: Type.STRING },
							},
							professorRecommendations: {
								type: Type.ARRAY,
								items: {
									type: Type.OBJECT,
									properties: {
										name: { type: Type.STRING },
										email: { type: Type.STRING },
										reason: { type: Type.STRING },
									},
									required: ['name', 'email', 'reason'],
								},
							},
							timeline: {
								type: Type.ARRAY,
								items: {
									type: Type.OBJECT,
									properties: {
										phase: { type: Type.STRING },
										activities: {
											type: Type.ARRAY,
											items: { type: Type.STRING },
										},
										duration: { type: Type.STRING },
									},
									required: ['phase', 'activities', 'duration'],
								},
							},
						},
						required: ['plan', 'prioritizedSteps', 'professorRecommendations', 'timeline'],
					},
					maxOutputTokens: config.ai.gemini.maxTokens,
					temperature: 0.7,
				},
			});

			if (!response.text || response.text.trim() === '') {
				throw new Error('Empty response from Gemini API for involvement plan');
			}

			const result = JSON.parse(response.text);
			return result;

		} catch (error) {
			console.error('Gemini involvement plan error:', error);
			return {
				plan: 'Start by exploring the recommended opportunities that align with your interests.',
				prioritizedSteps: [
					'Review your recommended organizations and labs',
					'Attend information sessions or meetings',
					'Connect with professors in your areas of interest',
					'Start with 1-2 commitments to avoid overcommitting',
				],
				professorRecommendations: professors.slice(0, 3).map(p => ({
					name: p.name,
					email: p.email,
					reason: 'Research areas align with your interests',
				})),
				timeline: [
					{
						phase: 'Exploration',
						activities: ['Research opportunities', 'Attend info sessions'],
						duration: '2-3 weeks',
					},
					{
						phase: 'Engagement',
						activities: ['Join 1-2 organizations', 'Start participating'],
						duration: '1 month',
					},
				],
			};
		}
	}

	/**
	 * Build involvement plan prompt
	 */
	private buildInvolvementPlanPrompt(
		userInterests: string[],
		opportunities: { type: 'lab' | 'org' | 'event'; item: any; score: number }[],
		professors: { name: string; email: string; researchAreas: string[]; labs: string[] }[],
	): string {
		const opportunitiesList = opportunities
			.slice(0, 10) // Top 10 opportunities
			.map(opp => `${opp.type.toUpperCase()}: ${opp.item.name} (Score: ${opp.score}/100)`)
			.join('\n');

		const professorsList = professors
			.slice(0, 8) // Top 8 professors
			.map(prof => `${prof.name} (${prof.email}) - Research: ${prof.researchAreas.join(', ')} - Labs: ${prof.labs.join(', ')}`)
			.join('\n');

		return `
You are creating a comprehensive involvement plan for a new university student.

STUDENT INTERESTS: ${userInterests.join(', ')}

TOP RECOMMENDED OPPORTUNITIES:
${opportunitiesList}

RELEVANT PROFESSORS:
${professorsList}

Create a comprehensive involvement plan that includes:
1. Overall strategy (2-3 sentences)
2. Prioritized action steps (5-7 steps)
3. Professor recommendations with reasons (3-5 professors)
4. Timeline with phases and activities

RESPONSE FORMAT (JSON):
{
  "plan": "Overall involvement strategy and approach",
  "prioritizedSteps": [
    "Step 1 with specific action",
    "Step 2 with specific action"
  ],
  "professorRecommendations": [
    {
      "name": "Professor Name",
      "email": "email@university.edu",
      "reason": "Specific reason why they should connect"
    }
  ],
  "timeline": [
    {
      "phase": "Phase Name",
      "activities": ["Activity 1", "Activity 2"],
      "duration": "Time estimate"
    }
  ]
}

Focus on:
- Realistic and achievable goals
- Balance between different types of involvement
- Building meaningful connections
- Progressive engagement over time
- Specific, actionable recommendations
`;
	}
}