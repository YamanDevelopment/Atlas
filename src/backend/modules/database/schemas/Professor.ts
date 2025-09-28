import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface IProfessor extends Document {
	id: number;

	name: string;
	email: string;
	department: string;
	title: string; // Professor, Associate Professor, Assistant Professor, etc.

	interests: number[]; // array of Interest IDs
	labs: number[]; // array of Lab IDs they're associated with

	recentResearch: {
		title: string;
		description: string;
		publicationDate: Date;
		link?: string;
		collaborators?: string[];
	}[];

	contactInfo: {
		officeLocation?: string;
		phoneNumber?: string;
		officeHours?: string;
		website?: string;
	};

	isAcceptingStudents: boolean;
	researchAreas: string[]; // Free text research areas

	createdAt: Date;
	updatedAt: Date;
}

const ProfessorSchema: Schema = new Schema<IProfessor>({
	id: { type: Number, required: true, unique: true },
	name: {
		type: String,
		required: true,
		trim: true,
		minlength: [2, 'Name must be at least 2 characters long'],
		maxlength: [100, 'Name cannot exceed 100 characters'],
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
	},
	department: {
		type: String,
		required: true,
		trim: true,
	},
	title: {
		type: String,
		required: true,
		trim: true,
	},

	interests: { type: [Number], ref: 'Interest' },
	labs: { type: [Number], ref: 'Lab' },

	recentResearch: [{
		title: { type: String, required: true, trim: true },
		description: { type: String, required: true, trim: true },
		publicationDate: { type: Date, required: true },
		link: { type: String, trim: true },
		collaborators: [{ type: String, trim: true }],
	}],

	contactInfo: {
		officeLocation: { type: String, trim: true },
		phoneNumber: { type: String, trim: true },
		officeHours: { type: String, trim: true },
		website: { type: String, trim: true },
	},

	isAcceptingStudents: { type: Boolean, default: true },
	researchAreas: [{ type: String, trim: true }],

	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

// Pre-save middleware to update timestamps
ProfessorSchema.pre('save', function(this: IProfessor, next) {
	this.updatedAt = new Date();
	next();
});

// Indexes for performance
ProfessorSchema.index({ email: 1 });
ProfessorSchema.index({ department: 1 });
ProfessorSchema.index({ interests: 1 });
ProfessorSchema.index({ labs: 1 });
ProfessorSchema.index({ isAcceptingStudents: 1 });
ProfessorSchema.index({ name: 1 });

export const Professor = mongoose.model<IProfessor>('Professor', ProfessorSchema);