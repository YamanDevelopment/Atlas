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

	lastLogin?: Date;
	createdAt: Date;
	updatedAt: Date;

	interests: number[]; // array of Interest IDs

	// Instance Methods
	comparePassword(candidatePassword: string): Promise<boolean>;
	addInterest(interestId: number): Promise<void>;
	removeInterest(interestId: number): Promise<void>;
}


const UserSchema: Schema = new Schema<IUser>({
	id: { type: Number, required: true, unique: true },
	name: {
		type: String,
		required: true,
		trim: true,
		minlength: [2, 'Name must be at least 2 characters long'],
		maxlength: [100, 'Name cannot exceed 100 characters'],
		match: [/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, apostrophes, and hyphens'],
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

	lastLogin: { type: Date },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },

	interests: { type: [Number], ref: 'Interest' },
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

// Indexes for performance
// Indexes for performance
// Note: id, username, and email already have unique indexes from field definitions
UserSchema.index({ interests: 1 }); // Interest-based queries
UserSchema.index({ lastLogin: -1 }); // Recent logins
UserSchema.index({ createdAt: -1 }); // Recently registered users
UserSchema.index({ name: 1 }); // Name searches

export const User = mongoose.model<IUser>('User', UserSchema);

