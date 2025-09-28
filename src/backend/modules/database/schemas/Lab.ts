import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

interface IWeightedTag {
	tagId: number;
	weight: number; // 0-1 confidence score
	category: 'primary' | 'secondary';
	parentTagId?: number; // References parent tag for secondary tags
}

interface IAIProcessing {
	lastAnalyzed: Date;
	geminiModel: string;
}

export interface ILab extends Document {
	id: number;
	name: string;
	url?: string;
	tags: IWeightedTag[]; // array of weighted Tag assignments
	aiProcessing?: IAIProcessing;
	description: string;
	department: string;
	principalInvestigator: string;
	location?: string;
	email?: string;
	acceptingStudents: boolean;
	researchAreas: string[];
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

const LabSchema: Schema<ILab> = new Schema<ILab>({
	id: { type: Number, required: true, unique: true },
	name: {
		type: String,
		required: true,
		trim: true,
		minlength: [2, 'Lab name must be at least 2 characters long'],
		maxlength: [200, 'Lab name cannot exceed 200 characters'],
		match: [/^[a-zA-Z0-9\s'&().-]+$/, 'Lab name can only contain letters, numbers, spaces, apostrophes, hyphens, ampersands, and parentheses'],
	},
	url: {
		type: String,
		required: false,
		trim: true,
		lowercase: true,
		match: [/^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/, 'Please provide a valid URL'],
	},
	tags: { type: [WeightedTagSchema], default: [] },
	aiProcessing: { type: AIProcessingSchema, required: false },
	description: {
		type: String,
		required: true,
		trim: true,
		minlength: [10, 'Description must be at least 10 characters long'],
		maxlength: [2000, 'Description cannot exceed 2000 characters'],
	},
	department: {
		type: String,
		required: true,
		trim: true,
		minlength: [2, 'Department must be at least 2 characters long'],
		maxlength: [100, 'Department cannot exceed 100 characters'],
	},
	principalInvestigator: {
		type: String,
		required: true,
		trim: true,
		minlength: [2, 'Principal Investigator name must be at least 2 characters long'],
		maxlength: [100, 'Principal Investigator name cannot exceed 100 characters'],
		match: [/^[a-zA-Z\s'-.,]+$/, 'Principal Investigator name can only contain letters, spaces, apostrophes, hyphens, commas, and periods'],
	},
	location: {
		type: String,
		required: false,
		trim: true,
		minlength: [2, 'Location must be at least 2 characters long'],
		maxlength: [200, 'Location cannot exceed 200 characters'],
	},
	email: {
		type: String,
		required: false,
		trim: true,
		lowercase: true,
		match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please provide a valid email address'],
	},
	acceptingStudents: {
		type: Boolean,
		default: true,
	},
	researchAreas: {
		type: [String],
		default: [],
		validate: {
			validator: function(areas: string[]) {
				return areas.every(area => area.trim().length >= 2 && area.trim().length <= 100);
			},
			message: 'Each research area must be between 2 and 100 characters',
		},
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
}, {
	timestamps: true,
});

// Indexes for performance
LabSchema.index({
	name: 'text',
	description: 'text',
	department: 'text',
	researchAreas: 'text',
}); // Text search
LabSchema.index({ department: 1 }); // Department filtering
LabSchema.index({ acceptingStudents: 1 }); // Student opportunity filtering
LabSchema.index({ 'tags.tagId': 1 }); // Tag-based filtering
LabSchema.index({ 'tags.weight': -1 }); // Weight-based sorting
LabSchema.index({ 'tags.category': 1 }); // Category filtering
LabSchema.index({ 'tags.parentTagId': 1 }); // Hierarchical tag queries
LabSchema.index({ 'aiProcessing.lastAnalyzed': -1 }); // AI processing tracking
LabSchema.index({ principalInvestigator: 1 }); // PI lookups
LabSchema.index({ department: 1, acceptingStudents: 1 }); // Compound filtering
LabSchema.index({ createdAt: -1 }); // Recently added labs
LabSchema.index({ updatedAt: -1 }); // Recently updated labs
// Note: id already has unique index from field definition

export const Lab = mongoose.model<ILab>('Lab', LabSchema);
