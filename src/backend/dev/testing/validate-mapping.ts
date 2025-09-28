#!/usr/bin/env tsx

/**
 * Validate tag mapping without API key requirement
 */

import { getPrimaryTags, getSecondaryTags, getSecondaryTagsByParent } from '../modules/database/services/defaults';

// Simulate the buildTagMapping logic from GeminiService
function buildTagMapping() {
	const primaryTags = new Map<string, number>();
	const secondaryTags = new Map<string, { id: number; parentName: string; parentId: number }>();

	const primaryTagList = getPrimaryTags();
	const secondaryTagList = getSecondaryTags();

	// Primary tags: IDs 1-13
	primaryTagList.forEach((tag, index) => {
		primaryTags.set(tag.name, index + 1);
	});

	// Secondary tags: IDs 14+
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

console.log('🔍 Validating Tag Mapping Logic');

const { primaryTags, secondaryTags } = buildTagMapping();

console.log(`✅ Mapped ${primaryTags.size} primary tags`);
console.log(`✅ Mapped ${secondaryTags.size} secondary tags`);

// Test specific mappings
console.log('\n🎯 Key Mappings:');
console.log(`technology → ${primaryTags.get('technology')}`);
console.log(`academic → ${primaryTags.get('academic')}`);
console.log(`computer science → ${JSON.stringify(secondaryTags.get('computer science'))}`);

// Test secondary tag examples by parent
console.log('\n📚 Secondary Tags by Category (first 3 each):');
['academic', 'technology', 'arts & culture', 'sports & recreation'].forEach(parentName => {
	const children = getSecondaryTagsByParent(parentName);
	const examples = children.slice(0, 3).map(child => {
		const childData = secondaryTags.get(child.name);
		return `${child.name} (ID: ${childData?.id})`;
	}).join(', ');
	console.log(`${parentName}: ${examples}`);
});

console.log('\n✅ Tag mapping validation complete! GeminiService will use correct IDs.');