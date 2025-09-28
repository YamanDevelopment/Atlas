import mongoose, { Document, Schema } from 'mongoose';

export interface ITag extends Document {
	id: number;
	name: string;
	category: 'primary' | 'secondary'; // e.g., primary: "Academic", secondary: "Computer Science"
	parentTag?: string; // Name of parent tag (null for primary tags)
	parentId?: number; // ID of parent tag (null for primary tags)
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
		match: [/^[a-zA-Z0-9\s'&().\-+]+$/, 'Tag name can only contain letters, numbers, spaces, apostrophes, hyphens, ampersands, parentheses, periods, and plus signs'],
	},
	category: {
		type: String,
		required: true,
		enum: ['primary', 'secondary'],
	},
	parentTag: {
		type: String,
		default: null,
		validate: {
			validator: function(this: ITag, value: string | null) {
				// Primary tags should not have a parent
				if (this.category === 'primary' && value) {
					return false;
				}
				// Secondary tags should have a parent
				if (this.category === 'secondary' && !value) {
					return false;
				}
				return true;
			},
			message: 'Primary tags cannot have a parent tag, secondary tags must have a parent tag',
		},
	},
	parentId: {
		type: Number,
		default: null,
		validate: {
			validator: function(this: ITag, value: number | null) {
				// Primary tags should not have a parentId
				if (this.category === 'primary' && value) {
					return false;
				}
				// Secondary tags should have a parentId
				if (this.category === 'secondary' && !value) {
					return false;
				}
				return true;
			},
			message: 'Primary tags cannot have a parentId, secondary tags must have a parentId',
		},
	},
	popularity: { type: Number, default: 0, min: 0 },

	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

// Indexes for performance
// Note: id and name already have unique indexes from field definitions
TagSchema.index({ category: 1 }); // Category filtering
TagSchema.index({ popularity: -1 }); // Most popular tags
TagSchema.index({ category: 1, popularity: -1 }); // Popular tags by category
TagSchema.index({ name: 'text' }); // Text search on names
TagSchema.index({ createdAt: -1 }); // Recently created tags
TagSchema.index({ parentTag: 1 }); // Parent tag relationships
TagSchema.index({ parentTag: 1, category: 1 }); // Children of specific parent
TagSchema.index({ parentId: 1 }); // Parent ID relationships

// Pre-save middleware to ensure data consistency
TagSchema.pre('save', function(next) {
	// Primary tags should not have a parent
	if (this.category === 'primary') {
		this.parentTag = undefined;
		this.parentId = undefined;
	}

	// Update timestamp
	this.updatedAt = new Date();
	next();
});

export const Tag = mongoose.model<ITag>('Tag', TagSchema);