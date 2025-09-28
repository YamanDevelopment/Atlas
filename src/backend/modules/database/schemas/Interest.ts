import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface ILinkedTag {
	tagId: number;
	weight: number; // 0–1, AI-generated weight for this interest-tag relationship
}

export interface IInterest extends Document {
	id: number;
	keyword: string;
	linkedTags: ILinkedTag[];
	isUserGenerated?: boolean;
	createdBy?: string; // user ID of creator if user-generated
	createdAt: Date;
	updatedAt: Date;
}

const LinkedTagSchema: Schema<ILinkedTag> = new Schema<ILinkedTag>(
	{
		tagId: { type: Number, ref: 'Tag', required: true },
		weight: {
			type: Number,
			required: true,
			min: [0, 'Weight must be at least 0'],
			max: [1, 'Weight cannot exceed 1'],
		},
	},
	{ _id: false },
);

const InterestSchema: Schema<IInterest> = new Schema<IInterest>({
	id: { type: Number, required: true, unique: true },
	keyword: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true,
		minLength: [2, 'Keyword must be at least 2 characters long'],
		maxLength: [50, 'Keyword cannot exceed 50 characters'],
		match: [/^[a-zA-Z0-9\s'-]+$/, 'Keyword can only contain letters, numbers, spaces, apostrophes, and hyphens'],
	},
	linkedTags: { type: [LinkedTagSchema], default: [] },
	isUserGenerated: { type: Boolean, default: false },
	createdBy: { type: String, required: false },

	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

// Indexes for performance
// Indexes for performance
// Note: id and keyword already have unique indexes from field definitions
InterestSchema.index({ keyword: 'text' }); // Text search on keywords
InterestSchema.index({ 'linkedTags.tagId': 1 }); // Tag association queries
InterestSchema.index({ isUserGenerated: 1 }); // Filter by generation type
InterestSchema.index({ createdBy: 1 }); // User-generated interests by creator
InterestSchema.index({ createdAt: -1 }); // Recently created interests
InterestSchema.index({ 'linkedTags.weight': -1 }); // High weight matches

export const Interest = mongoose.model<IInterest>('Interest', InterestSchema);