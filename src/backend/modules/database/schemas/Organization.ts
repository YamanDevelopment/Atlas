import mongoose, { Document, Schema } from 'mongoose';

export interface IOrganization extends Document {
	id: number;
	name: string;
	shortName?: string;
	url?: string;
	logoUrl?: string;
	tags: number[]; // array of Tag IDs
	description: string;
	createdAt: Date;
	updatedAt: Date;
};

const OrganizationSchema: Schema<IOrganization> = new Schema<IOrganization>({
	id: { type: Number, required: true, unique: true },
	name: {
		type: String,
		required: true,
		trim: true,
		minlength: [2, 'Organization name must be at least 2 characters long'],
		maxlength: [100, 'Organization name cannot exceed 100 characters'],
		match: [/^[a-zA-Z0-9\s'-&]+$/, 'Organization name can only contain letters, numbers, spaces, apostrophes, hyphens, and ampersands'],
	},
	shortName: {
		type: String,
		required: false,
		trim: true,
		minlength: [1, 'Short name must be at least 1 character long'],
		maxlength: [50, 'Short name cannot exceed 50 characters'],
		match: [/^[a-zA-Z0-9\s'-&]+$/, 'Short name can only contain letters, numbers, spaces, apostrophes, hyphens, and ampersands'],
	},
	url: {
		type: String,
		required: false,
		trim: true,
		lowercase: true,
		match: [/^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/, 'Please provide a valid URL'],
	},
	logoUrl: {
		type: String,
		required: false,
		trim: true,
		lowercase: true,
		match: [/^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/, 'Please provide a valid URL'],
	},
	tags: { type: [Number], ref: 'Tag', default: [] },
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
OrganizationSchema.index({ tags: 1 }); // Tag-based filtering
OrganizationSchema.index({ name: 1 }); // Name lookups
OrganizationSchema.index({ shortName: 1 }); // Short name lookups
OrganizationSchema.index({ createdAt: -1 }); // Recent organizations
OrganizationSchema.index({ updatedAt: -1 }); // Recently updated
OrganizationSchema.index({ id: 1 }); // ID lookups (compound with other fields)

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);