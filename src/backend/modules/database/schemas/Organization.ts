import mongoose, { Document, Schema } from 'mongoose';

export interface IWeightedTag {
	tagId: number;
	weight: number; // 0–1, AI-generated weight for this content-tag relationship
	category: 'primary' | 'secondary';
	parentTagId?: number; // Only for secondary tags
}

export interface IAIProcessing {
	lastAnalyzed: Date;
	geminiModel: string; // e.g., "gemini-2.5-flash"
}

export interface IOrganization extends Document {
	id: number;
	name: string;
	shortName?: string;
	url?: string;
	logoUrl?: string;
	tags: IWeightedTag[]; // Weighted tag assignments with AI confidence scores
	description: string;
	aiProcessing?: IAIProcessing; // AI analysis metadata
	createdAt: Date;
	updatedAt: Date;
}

const WeightedTagSchema: Schema<IWeightedTag> = new Schema<IWeightedTag>(
	{
		tagId: { type: Number, ref: 'Tag', required: true },
		weight: {
			type: Number,
			required: true,
			min: [0, 'Weight must be at least 0'],
			max: [1, 'Weight cannot exceed 1'],
		},
		category: {
			type: String,
			required: true,
			enum: ['primary', 'secondary'],
		},
		parentTagId: { type: Number, ref: 'Tag', required: false },
	},
	{ _id: false },
);

const AIProcessingSchema: Schema<IAIProcessing> = new Schema<IAIProcessing>(
	{
		lastAnalyzed: { type: Date, required: true },
		geminiModel: { type: String, required: true },
	},
	{ _id: false },
);

const OrganizationSchema: Schema<IOrganization> = new Schema<IOrganization>({
	id: { type: Number, required: true, unique: true },
	name: {
		type: String,
		required: true,
		trim: true,
		minlength: [2, 'Organization name must be at least 2 characters long'],
		maxlength: [100, 'Organization name cannot exceed 100 characters'],
		match: [/^[a-zA-Z0-9\s'&-]+$/, 'Organization name can only contain letters, numbers, spaces, apostrophes, hyphens, and ampersands'],
	},
	shortName: {
		type: String,
		required: false,
		trim: true,
		minlength: [1, 'Short name must be at least 1 character long'],
		maxlength: [50, 'Short name cannot exceed 50 characters'],
		match: [/^[a-zA-Z0-9\s'&-]+$/, 'Short name can only contain letters, numbers, spaces, apostrophes, hyphens, and ampersands'],
	},
	url: {
		type: String,
		required: false,
		trim: true,
		lowercase: true,
		match: [/^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w./?%&=-]*)?$/, 'Please provide a valid URL'],
	},
	logoUrl: {
		type: String,
		required: false,
		trim: true,
		lowercase: true,
		match: [/^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w./?%&=-]*)?$/, 'Please provide a valid URL'],
	},
	tags: { type: [WeightedTagSchema], required: true },
	aiProcessing: { type: AIProcessingSchema, required: false },
	description: {
		type: String,
		required: true,
		trim: true,
		minlength: [10, 'Description must be at least 10 characters long'],
		maxlength: [2000, 'Description cannot exceed 2000 characters'],
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

OrganizationSchema.index({ name: 'text', description: 'text' }); // Text search
OrganizationSchema.index({ 'tags.tagId': 1 }); // Tag-based filtering
OrganizationSchema.index({ 'tags.weight': -1 }); // Weight-based sorting
OrganizationSchema.index({ 'tags.category': 1 }); // Category filtering
OrganizationSchema.index({ 'tags.parentTagId': 1 }); // Hierarchical tag queries
OrganizationSchema.index({ 'aiProcessing.lastAnalyzed': -1 }); // AI processing tracking
OrganizationSchema.index({ name: 1 }); // Name lookups
OrganizationSchema.index({ shortName: 1 }); // Short name lookups
OrganizationSchema.index({ createdAt: -1 }); // Recent organizations
OrganizationSchema.index({ updatedAt: -1 }); // Recently updated
// Note: id already has unique index from field definition

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);