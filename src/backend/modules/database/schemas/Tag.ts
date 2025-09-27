import mongoose, { Document, Schema } from 'mongoose';

export interface ITag extends Document {
	id: number;
	name: string;
	category: 'primary' | 'secondary'; // e.g., primary: "Academic", secondary: "Computer Science"
	parentTag?: mongoose.Types.ObjectId; // Reference to parent tag (null for primary tags)
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
	parentTag: {
		type: Schema.Types.ObjectId,
		ref: 'Tag',
		default: null,
		validate: {
			validator: async function(this: ITag, value: mongoose.Types.ObjectId | null) {
				if (!value) return true; // null is valid (primary tags have no parent)

				// Check that parent tag exists and is a primary tag
				const parentTag = await mongoose.model('Tag').findById(value);
				return parentTag && parentTag.category === 'primary';
			},
			message: 'Parent tag must exist and be a primary category tag',
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

// Pre-save middleware to ensure data consistency
TagSchema.pre('save', function(next) {
	// Primary tags should not have a parent
	if (this.category === 'primary' && this.parentTag) {
		this.parentTag = undefined;
	}

	// Secondary tags should have a parent (will be validated by the validator above)
	// Update timestamp
	this.updatedAt = new Date();
	next();
});

export const Tag = mongoose.model<ITag>('Tag', TagSchema);