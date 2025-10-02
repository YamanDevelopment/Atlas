import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

export interface IUser extends Document {
	id: number;

	name: string;
	username: string;
	email: string;
	password: string; // hashed password
	role: string; // user role: 'user' | 'admin' | 'moderator'

	lastLogin?: Date;
	createdAt: Date;
	updatedAt: Date;

	interests: number[]; // array of Interest IDs

	// Involvement tracking
	commitments: {
		type: 'lab' | 'organization';
		itemId: number;
		status: 'pending' | 'active' | 'passive' | 'inactive';
		joinedAt: Date;
		lastUpdated: Date;
	}[];

	bookmarkedEvents: {
		eventId: number;
		bookmarkedAt: Date;
	}[];

	// Instance Methods
	comparePassword(candidatePassword: string): Promise<boolean>;
	addInterest(interestId: number): Promise<void>;
	removeInterest(interestId: number): Promise<void>;
	addCommitment(type: 'lab' | 'organization', itemId: number): Promise<void>;
	updateCommitmentStatus(type: 'lab' | 'organization', itemId: number, status: 'pending' | 'active' | 'passive' | 'inactive'): Promise<void>;
	removeCommitment(type: 'lab' | 'organization', itemId: number): Promise<void>;
	bookmarkEvent(eventId: number): Promise<void>;
	unbookmarkEvent(eventId: number): Promise<void>;
}


const UserSchema: Schema = new Schema<IUser>({
	id: { type: Number, required: true, unique: true },
	name: {
		type: String,
		required: true,
		trim: true,
		minlength: [2, 'Name must be at least 2 characters long'],
		maxlength: [100, 'Name cannot exceed 100 characters'],
		match: [/^[a-zA-Z0-9\s'_-]+$/, 'Name can only contain letters, numbers, spaces, apostrophes, hyphens, and underscores'],
	},
	username: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		minlength: [3, 'Username must be at least 3 characters'],
		maxlength: [30, 'Username cannot exceed 30 characters'],
		match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'],
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
		validate: [validator.isEmail, 'Please provide a valid email address'],
	},
	password: { type: String, required: true, minlength: 6 },
	role: {
		type: String,
		required: true,
		default: 'user',
		enum: ['user', 'admin', 'moderator'],
	},

	lastLogin: { type: Date },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },

	interests: { type: [Number] },

	// Involvement tracking
	commitments: [{
		type: { type: String, enum: ['lab', 'organization'], required: true },
		itemId: { type: Number, required: true },
		status: {
			type: String,
			enum: ['pending', 'active', 'passive', 'inactive'],
			default: 'pending',
			required: true,
		},
		joinedAt: { type: Date, default: Date.now },
		lastUpdated: { type: Date, default: Date.now },
	}],

	bookmarkedEvents: [{
		eventId: { type: Number, required: true },
		bookmarkedAt: { type: Date, default: Date.now },
	}],
});

// Instance method to compare passwords
UserSchema.methods.comparePassword = async function(this: IUser, candidatePassword: string): Promise<boolean> {
	try {
		return await bcrypt.compare(candidatePassword, this.password);
	} catch (error) {
		throw new Error('Error comparing passwords: ' + (error as Error).message);
	}
};

// Pre-save middleware for password hashing
UserSchema.pre('save', async function(this: IUser, next) {
	// Only hash password if it's modified
	if (!this.isModified('password')) return next();

	try {
		const salt = await bcrypt.genSalt(12); // Increased salt rounds for better security
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error as Error);
	}
});

// Pre-save middleware to update timestamps
UserSchema.pre('save', function(this: IUser, next) {
	this.updatedAt = new Date();
	next();
});

// Instance method to add an interest
UserSchema.methods.addInterest = async function(this: IUser, interestId: number): Promise<void> {
	if (!this.interests.includes(interestId)) {
		this.interests.push(interestId);
		await this.save();
	}
};

// Instance method to remove an interest
UserSchema.methods.removeInterest = async function(this: IUser, interestId: number): Promise<void> {
	const index = this.interests.indexOf(interestId);
	if (index > -1) {
		this.interests.splice(index, 1);
		await this.save();
	}
};

// Instance method to add a commitment
UserSchema.methods.addCommitment = async function(this: IUser, type: 'lab' | 'organization', itemId: number): Promise<void> {
	// Check if commitment already exists
	const existingCommitment = this.commitments.find(c => c.type === type && c.itemId === itemId);
	if (!existingCommitment) {
		this.commitments.push({
			type,
			itemId,
			status: 'pending',
			joinedAt: new Date(),
			lastUpdated: new Date(),
		});
		await this.save();
	}
};

// Instance method to update commitment status
UserSchema.methods.updateCommitmentStatus = async function(this: IUser, type: 'lab' | 'organization', itemId: number, status: 'pending' | 'active' | 'passive' | 'inactive'): Promise<void> {
	const commitment = this.commitments.find(c => c.type === type && c.itemId === itemId);
	if (commitment) {
		commitment.status = status;
		commitment.lastUpdated = new Date();
		await this.save();
	}
};

// Instance method to remove a commitment
UserSchema.methods.removeCommitment = async function(this: IUser, type: 'lab' | 'organization', itemId: number): Promise<void> {
	const index = this.commitments.findIndex(c => c.type === type && c.itemId === itemId);
	if (index > -1) {
		this.commitments.splice(index, 1);
		await this.save();
	}
};

// Instance method to bookmark an event
UserSchema.methods.bookmarkEvent = async function(this: IUser, eventId: number): Promise<void> {
	// Check if event is already bookmarked
	const existingBookmark = this.bookmarkedEvents.find(b => b.eventId === eventId);
	if (!existingBookmark) {
		this.bookmarkedEvents.push({
			eventId,
			bookmarkedAt: new Date(),
		});
		await this.save();
	}
};

// Instance method to unbookmark an event
UserSchema.methods.unbookmarkEvent = async function(this: IUser, eventId: number): Promise<void> {
	const index = this.bookmarkedEvents.findIndex(b => b.eventId === eventId);
	if (index > -1) {
		this.bookmarkedEvents.splice(index, 1);
		await this.save();
	}
};

// Indexes for performance
// Indexes for performance
// Note: id, username, and email already have unique indexes from field definitions
UserSchema.index({ interests: 1 }); // Interest-based queries
UserSchema.index({ lastLogin: -1 }); // Recent logins
UserSchema.index({ createdAt: -1 }); // Recently registered users
UserSchema.index({ name: 1 }); // Name searches

export const User = mongoose.model<IUser>('User', UserSchema);

