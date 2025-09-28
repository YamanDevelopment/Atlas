import bcrypt from 'bcryptjs';

/**
 * Password Service for handling password hashing and validation
 *
 * How it works:
 * 1. Passwords are hashed using bcrypt with salt rounds of 12
 * 2. comparePassword verifies a plain password against a hash
 * 3. This service can be used independently or with the User schema
 */
export class PasswordService {
	private readonly SALT_ROUNDS = 12;

	/**
	 * Hash a plain text password
	 */
	async hashPassword(plainPassword: string): Promise<string> {
		try {
			console.log('🔐 Hashing password...');
			const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
			const hashedPassword = await bcrypt.hash(plainPassword, salt);
			console.log('✅ Password hashed successfully');
			return hashedPassword;
		} catch (error) {
			console.error('❌ Error hashing password:', error);
			throw new Error('Failed to hash password');
		}
	}

	/**
	 * Compare a plain text password with a hashed password
	 */
	async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
		try {
			const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
			console.log(`🔍 Password comparison result: ${isMatch ? 'MATCH' : 'NO MATCH'}`);
			return isMatch;
		} catch (error) {
			console.error('❌ Error comparing passwords:', error);
			throw new Error('Failed to compare password');
		}
	}

	/**
	 * Validate password strength
	 */
	validatePassword(password: string): {
		isValid: boolean;
		errors: string[];
		strength: 'weak' | 'medium' | 'strong';
	} {
		const errors: string[] = [];
		let score = 0;

		// Length check
		if (password.length < 6) {
			errors.push('Password must be at least 6 characters long');
		} else if (password.length >= 8) {
			score += 1;
		}

		// Character variety checks
		if (!/[a-z]/.test(password)) {
			errors.push('Password must contain at least one lowercase letter');
		} else {
			score += 1;
		}

		if (!/[A-Z]/.test(password)) {
			errors.push('Password must contain at least one uppercase letter');
		} else {
			score += 1;
		}

		if (!/[0-9]/.test(password)) {
			errors.push('Password must contain at least one number');
		} else {
			score += 1;
		}

		if (!/[^a-zA-Z0-9]/.test(password)) {
			errors.push('Password must contain at least one special character');
		} else {
			score += 1;
		}

		// Determine strength
		let strength: 'weak' | 'medium' | 'strong' = 'weak';
		if (score >= 4) strength = 'strong';
		else if (score >= 2) strength = 'medium';

		return {
			isValid: errors.length === 0 && password.length >= 6,
			errors,
			strength,
		};
	}

	/**
	 * Generate a secure random password
	 */
	generateSecurePassword(length: number = 12): string {
		const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
		let password = '';

		// Ensure at least one character from each category
		const categories = [
			'abcdefghijklmnopqrstuvwxyz', // lowercase
			'ABCDEFGHIJKLMNOPQRSTUVWXYZ', // uppercase
			'0123456789', // numbers
			'!@#$%^&*', // special chars
		];

		// Add one character from each category
		for (const category of categories) {
			const randomIndex = Math.floor(Math.random() * category.length);
			password += category[randomIndex];
		}

		// Fill the rest with random characters
		for (let i = password.length; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * charset.length);
			password += charset[randomIndex];
		}

		// Shuffle the password
		return password.split('').sort(() => Math.random() - 0.5).join('');
	}
}

// Export singleton instance
export const passwordService = new PasswordService();