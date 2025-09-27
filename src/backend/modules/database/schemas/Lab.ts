import mongoose, { Document, Schema } from 'mongoose';

export interface ILab extends Document {
	id: number;
	name: string;
	url?: string;
	tags: number[]; // array of Tag IDs
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
	tags: { type: [Number], ref: 'Tag', default: [] },
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
LabSchema.index({ tags: 1 }); // Tag-based filtering
LabSchema.index({ principalInvestigator: 1 }); // PI lookups
LabSchema.index({ department: 1, acceptingStudents: 1 }); // Compound filtering
LabSchema.index({ createdAt: -1 }); // Recently added labs
LabSchema.index({ updatedAt: -1 }); // Recently updated labs
LabSchema.index({ id: 1 }); // ID lookups

export default mongoose.model<ILab>('Lab', LabSchema);
