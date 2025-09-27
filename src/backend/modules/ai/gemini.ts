import { GoogleGenAI, Type } from '@google/genai';
import { IWeightedTag } from '../database/schemas/Event';
import config from '../../../config';
import { COMPREHENSIVE_TAGS, getPrimaryTags, getSecondaryTags, getSecondaryTagsByParent } from '../database/services/defaults';

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
	 * Analyze content and return weighted hierarchical tags
	 * Implements two-phase weighting as specified
	 */
	async analyzeContent(content: ContentAnalysisRequest): Promise<GeminiAnalysisResult> {
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

			const analysisResult = JSON.parse(response.text || '{}');

			// Validate the analysis results
			if (!analysisResult.tags || !Array.isArray(analysisResult.tags)) {
				throw new Error('Invalid response format: tags array is required');
			}

			// Enforce maximum tags limit from config
			const limitedTags = analysisResult.tags.slice(0, config.ai.tagging.maxTagsPerItem);

			// Filter out tags below confidence threshold
			const filteredTags = limitedTags.filter((tag: any) =>
				tag.weight >= config.ai.tagging.confidenceThreshold,
			);

			return {
				tags: filteredTags,
				confidence: analysisResult.overallConfidence || 0.8,
				modelUsed: config.ai.gemini.model,
			};
		} catch (error) {
			console.error('Gemini analysis error:', error);
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

			const analysisResult = JSON.parse(response.text || '{}');

			// Validate the analysis results
			if (!analysisResult.tags || !Array.isArray(analysisResult.tags)) {
				throw new Error('Invalid response format: tags array is required');
			}

			// Enforce maximum tags limit from config (allow slightly more for interests)
			const maxInterestTags = Math.min(config.ai.tagging.maxTagsPerItem + 2, 7);
			const limitedTags = analysisResult.tags.slice(0, maxInterestTags);

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

		// Build primary categories list with real IDs
		const primaryCategoriesList = Array.from(primaryTags.entries())
			.map(([name, id]) => `${id}. ${name.charAt(0).toUpperCase() + name.slice(1)} (ID: ${id})`)
			.join('\n');

		// Build more comprehensive secondary tag examples
		const secondaryExamplesByCategory = Array.from(primaryTags.entries())
			.map(([parentName]) => {
				const children = getSecondaryTagsByParent(parentName);
				if (children.length > 0) {
					const childExamples = children.slice(0, 4).map(child => {
						const childData = secondaryTags.get(child.name);
						return `${child.name} (${childData?.id})`;
					}).join(', ');
					return `${parentName.toUpperCase()}: ${childExamples}`;
				}
				return null;
			})
			.filter(Boolean)
			.join('\n');

		return `
You are an expert AI system that analyzes user interests and maps them to hierarchical university categories.

Analyze the following user interest and assign weighted tags using a two-phase approach:

PHASE 1: Primary Tag Analysis
- Analyze against ${primaryTags.size} broad primary categories
- Assign weights (0-1) based on relevance and user interest strength
- Only consider primary tags with weight >= 0.7 for Phase 2

PHASE 2: Secondary Tag Analysis  
- For primary tags >= 0.7, analyze against their secondary tags
- Assign weights for relevant secondary tags based on specificity
- Secondary tags must include parentTagId

PRIMARY CATEGORIES (with exact IDs):
${primaryCategoriesList}

SECONDARY TAGS BY CATEGORY:
${secondaryExamplesByCategory}

INTEREST TO ANALYZE:
Interest Keyword: "${interest.interestKeyword}"
${descriptionInfo}
${contextInfo}

INSTRUCTIONS:
- Return structured JSON with tags array, overallConfidence, and suggestedInterestName
- Include 2-7 weighted tags total (can be multiple categories for broad interests)
- Primary tags need weight >= ${config.ai.tagging.confidenceThreshold} to include secondary tags
- Use EXACT tag IDs from the system above (Primary: 1-${primaryTags.size}, Secondary: ${primaryTags.size + 1}+)
- Weights should reflect interest strength and specificity (0-1 scale)
- Secondary tags must include parentTagId field (use correct parent ID from primary tags)
- Provide a refined suggestedInterestName that's clear and specific
- Consider multiple categories if the interest spans areas (e.g., "game development" = technology + arts & culture)
- Focus on relevance to university activities and student interests
`;
	}

	private buildAnalysisPrompt(content: ContentAnalysisRequest): string {
		const contextInfo = content.additionalContext ?
			`Additional context: ${JSON.stringify(content.additionalContext)}` : '';

		const { primaryTags, secondaryTags } = this.buildTagMapping();

		// Build primary categories list with real IDs
		const primaryCategoriesList = Array.from(primaryTags.entries())
			.map(([name, id]) => `${id}. ${name.charAt(0).toUpperCase() + name.slice(1)} (ID: ${id})`)
			.join('\n');

		// Build sample secondary tags by category
		const secondaryExamples = Array.from(primaryTags.entries())
			.slice(0, 5) // Show examples for first 5 categories
			.map(([parentName]) => {
				const children = getSecondaryTagsByParent(parentName);
				if (children.length > 0) {
					const childExamples = children.slice(0, 3).map(child => {
						const childData = secondaryTags.get(child.name);
						return `${child.name} (${childData?.id})`;
					}).join(', ');
					return `${parentName}: ${childExamples}`;
				}
				return null;
			})
			.filter(Boolean)
			.join('\n');

		return `
You are an expert AI system that categorizes university content using a hierarchical tag system.

Analyze the following content and assign weighted tags using a two-phase approach:

PHASE 1: Primary Tag Analysis
- Analyze against ${primaryTags.size} broad primary categories
- Assign weights (0-1) based on relevance
- Only consider primary tags with weight >= 0.7 for Phase 2

PHASE 2: Secondary Tag Analysis  
- For primary tags >= 0.7, analyze against their secondary tags
- Assign weights for relevant secondary tags
- Secondary tags must include parentTagId

PRIMARY CATEGORIES (with exact IDs):
${primaryCategoriesList}

SECONDARY TAG EXAMPLES:
${secondaryExamples}

CONTENT TO ANALYZE:
Title: "${content.title}"
Description: "${content.description}"
${contextInfo}

INSTRUCTIONS:
- Return structured JSON with tags array and overallConfidence
- Include 2-${config.ai.tagging.maxTagsPerItem} weighted tags total
- Primary tags need weight >= ${config.ai.tagging.confidenceThreshold} to include secondary tags
- Use EXACT tag IDs from the system above (Primary: 1-${primaryTags.size}, Secondary: ${primaryTags.size + 1}+)
- Weights must reflect content relevance (0-1 scale)
- Secondary tags must include parentTagId field
- Focus on accuracy and relevance over quantity
`;
	}

	/**
	 * Batch analyze multiple content items with intelligent rate limiting
	 */
	async batchAnalyze(contentItems: ContentAnalysisRequest[]): Promise<GeminiAnalysisResult[]> {
		const results: GeminiAnalysisResult[] = [];

		// Use smaller batch size for more reliable processing
		const batchSize = Math.min(3, contentItems.length);
		const delayMs = 1500; // Conservative rate limiting

		for (let i = 0; i < contentItems.length; i += batchSize) {
			const batch = contentItems.slice(i, i + batchSize);
			console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(contentItems.length / batchSize)}`);

			const batchPromises = batch.map(async (content, index) => {
				try {
					// Add small delay between items in the same batch
					if (index > 0) {
						await new Promise(resolve => setTimeout(resolve, 300));
					}
					return await this.analyzeContent(content);
				} catch (error) {
					console.error(`Failed to analyze content "${content.title}":`, error);
					return null; // Return null for failed items
				}
			});

			try {
				const batchResults = await Promise.all(batchPromises);
				// Filter out null results from failed analyses
				const successfulResults = batchResults.filter((result): result is GeminiAnalysisResult => result !== null);
				results.push(...successfulResults);

				console.log(`Batch completed: ${successfulResults.length}/${batch.length} successful`);
			} catch (error) {
				console.error(`Batch processing failed for batch starting at index ${i}:`, error);
				// Continue with next batch rather than failing entirely
			}

			// Rate limiting delay between batches
			if (i + batchSize < contentItems.length) {
				console.log(`Waiting ${delayMs}ms before next batch...`);
				await new Promise(resolve => setTimeout(resolve, delayMs));
			}
		}

		console.log(`Batch analysis complete: ${results.length}/${contentItems.length} items processed successfully`);
		return results;
	}

	/**
	 * Batch analyze multiple user interests
	 */
	async batchAnalyzeInterests(interests: InterestAnalysisRequest[]): Promise<InterestAnalysisResult[]> {
		const results: InterestAnalysisResult[] = [];

		// Use smaller batch size for more reliable processing
		const batchSize = Math.min(3, interests.length);
		const delayMs = 1500; // Conservative rate limiting

		for (let i = 0; i < interests.length; i += batchSize) {
			const batch = interests.slice(i, i + batchSize);
			console.log(`Processing interest batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(interests.length / batchSize)}`);

			const batchPromises = batch.map(async (interest, index) => {
				try {
					// Add small delay between items in the same batch
					if (index > 0) {
						await new Promise(resolve => setTimeout(resolve, 300));
					}
					return await this.analyzeInterest(interest);
				} catch (error) {
					console.error(`Failed to analyze interest "${interest.interestKeyword}":`, error);
					return null; // Return null for failed items
				}
			});

			try {
				const batchResults = await Promise.all(batchPromises);
				// Filter out null results from failed analyses
				const successfulResults = batchResults.filter((result): result is InterestAnalysisResult => result !== null);
				results.push(...successfulResults);

				console.log(`Interest batch completed: ${successfulResults.length}/${batch.length} successful`);
			} catch (error) {
				console.error(`Interest batch processing failed for batch starting at index ${i}:`, error);
				// Continue with next batch rather than failing entirely
			}

			// Rate limiting delay between batches
			if (i + batchSize < interests.length) {
				console.log(`Waiting ${delayMs}ms before next interest batch...`);
				await new Promise(resolve => setTimeout(resolve, delayMs));
			}
		}

		console.log(`Interest batch analysis complete: ${results.length}/${interests.length} items processed successfully`);
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
}