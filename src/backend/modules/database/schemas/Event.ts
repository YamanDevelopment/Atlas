import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
	id: number;
	name: string;
	url?: string;
	tags: number[]; // array of Tag IDs
	description: string;
	location?: string;
	startTime: Date;
	endTime: Date;
	organization?: number; // Organization ID
	latitude?: number;
	longitude?: number;
	createdAt: Date;
	updatedAt: Date;
};

const EventSchema: Schema<IEvent> = new Schema<IEvent>({
	id: { type: Number, required: true, unique: true },
	name: {
		type: String,
		required: true,
		trim: true,
		minlength: [2, 'Event name must be at least 2 characters long'],
		maxlength: [200, 'Event name cannot exceed 200 characters'],
		match: [/^[a-zA-Z0-9\s'-&]+$/, 'Event name can only contain letters, numbers, spaces, apostrophes, hyphens, and ampersands'],
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
		maxlength: [5000, 'Description cannot exceed 5000 characters'],
	},
	location: {
		type: String,
		required: false,
		trim: true,
		minlength: [2, 'Location must be at least 2 characters long'],
		maxlength: [200, 'Location cannot exceed 200 characters'],
	},
	startTime: { type: Date, required: true },
	endTime: { type: Date, required: true },
	organization: { type: Number, ref: 'Organization', required: false },
	latitude: {
		type: Number,
		required: false,
		min: [-90, 'Latitude must be at least -90'],
		max: [90, 'Latitude cannot exceed 90'],
	},
	longitude: {
		type: Number,
		required: false,
		min: [-180, 'Longitude must be at least -180'],
		max: [180, 'Longitude cannot exceed 180'],
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

// Indexes for performance
EventSchema.index({ name: 'text', description: 'text', location: 'text' }); // Text search
EventSchema.index({ startTime: 1, endTime: 1 }); // Date range queries
EventSchema.index({ startTime: 1 }); // Upcoming events
EventSchema.index({ endTime: 1 }); // Past events
EventSchema.index({ tags: 1 }); // Tag-based filtering
EventSchema.index({ organization: 1 }); // Events by organization
EventSchema.index({ organization: 1, startTime: 1 }); // Org events by date
EventSchema.index({ location: 1 }); // Location-based queries
EventSchema.index({ latitude: 1, longitude: 1 }); // Geospatial queries
EventSchema.index({ createdAt: -1 }); // Recently created
EventSchema.index({ updatedAt: -1 }); // Recently updated
EventSchema.index({ id: 1 }); // ID lookups

export const Event = mongoose.model<IEvent>('Event', EventSchema);