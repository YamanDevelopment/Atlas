import mongoose, { Document, Schema } from 'mongoose';

export interface ITag extends Document {
	id: number;
	name: string;
	category: 'primary' | 'secondary'; // e.g., primary: "Academic", secondary: "Computer Science", tertiary: "AI"
	popularity: number; // number of times tag has been used/linked
	createdAt: Date;
	updatedAt: Date;
}

const TagSchema: Schema<ITag> = new Schema<ITag>({
	id: { type: Number, required: true, unique: true },
	name: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true,
		minLength: [2, 'Tag name must be at least 2 characters long'],
		maxLength: [50, 'Tag name cannot exceed 50 characters'],
		match: [/^[a-zA-Z0-9\s'-]+$/, 'Tag name can only contain letters, numbers, spaces, apostrophes, and hyphens'],
	},
	category: {
		type: String,
		required: true,
		enum: ['primary', 'secondary'],
	},
	popularity: { type: Number, default: 0, min: 0 },

	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

// Indexes for performance
TagSchema.index({ name: 1 }); // Name lookups
TagSchema.index({ category: 1 }); // Category filtering
TagSchema.index({ popularity: -1 }); // Most popular tags
TagSchema.index({ category: 1, popularity: -1 }); // Popular tags by category
TagSchema.index({ name: 'text' }); // Text search on names
TagSchema.index({ createdAt: -1 }); // Recently created tags
TagSchema.index({ id: 1 }); // ID lookups

export const Tag = mongoose.model<ITag>('Tag', TagSchema);