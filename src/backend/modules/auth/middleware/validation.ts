import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Validation Middleware
 *
 * How it works:
 * 1. Defines validation schemas using Joi
 * 2. Validates request body, params, and query separately
 * 3. Returns 400 with detailed errors if validation fails
 * 4. Sanitizes input data (trims strings, etc.)
 */

// Generic validation middleware factory
export const validate = (schema: {
	body?: Joi.ObjectSchema;
	params?: Joi.ObjectSchema;
	query?: Joi.ObjectSchema;
}) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		const errors: string[] = [];

		// Validate body
		if (schema.body) {
			const { error, value } = schema.body.validate(req.body, {
				abortEarly: false,
				stripUnknown: true,
			});
			if (error) {
				errors.push(...error.details.map(detail => `Body: ${detail.message}`));
			} else {
				req.body = value; // Use sanitized value
			}
		}

		// Validate params
		if (schema.params) {
			const { error, value } = schema.params.validate(req.params, {
				abortEarly: false,
				stripUnknown: true,
			});
			if (error) {
				errors.push(...error.details.map(detail => `Params: ${detail.message}`));
			} else {
				req.params = { ...req.params, ...value };
			}
		}

		// Validate query
		if (schema.query) {
			const { error, value } = schema.query.validate(req.query, {
				abortEarly: false,
				stripUnknown: true,
			});
			if (error) {
				errors.push(...error.details.map(detail => `Query: ${detail.message}`));
			} else {
				req.query = value;
			}
		}

		// Return errors if any
		if (errors.length > 0) {
			console.warn(`🚫 Validation failed for ${req.method} ${req.path}:`, errors);
			res.status(400).json({
				error: 'Validation failed',
				message: 'Please check your request data',
				details: errors,
			});
			return;
		}

		console.log(`✅ Validation passed for ${req.method} ${req.path}`);
		next();
	};
};

// Common validation schemas
export const validationSchemas = {
	// User registration
	register: {
		body: Joi.object({
			name: Joi.string()
				.trim()
				.min(2)
				.max(100)
				.pattern(/^[a-zA-Z\s'-]+$/)
				.required()
				.messages({
					'string.pattern.base': 'Name can only contain letters, spaces, apostrophes, and hyphens',
				}),
			username: Joi.string()
				.trim()
				.min(3)
				.max(30)
				.pattern(/^[a-zA-Z0-9_-]+$/)
				.required()
				.messages({
					'string.pattern.base': 'Username can only contain letters, numbers, hyphens, and underscores',
				}),
			email: Joi.string()
				.trim()
				.email()
				.lowercase()
				.required(),
			password: Joi.string()
				.min(6)
				.required(),
		}),
	},

	// User login
	login: {
		body: Joi.object({
			username: Joi.string()
				.trim()
				.required()
				.messages({
					'any.required': 'Username is required',
				}),
			password: Joi.string()
				.required()
				.messages({
					'any.required': 'Password is required',
				}),
		}),
	},

	// Refresh token
	refreshToken: {
		body: Joi.object({
			refreshToken: Joi.string()
				.required()
				.messages({
					'any.required': 'Refresh token is required',
				}),
		}),
	},

	// User profile update
	updateProfile: {
		body: Joi.object({
			name: Joi.string()
				.trim()
				.min(2)
				.max(100)
				.pattern(/^[a-zA-Z\s'-]+$/)
				.optional(),
			email: Joi.string()
				.trim()
				.email()
				.lowercase()
				.optional(),
		}),
		params: Joi.object({
			userId: Joi.string()
				.pattern(/^[0-9a-fA-F]{24}$/)
				.required()
				.messages({
					'string.pattern.base': 'User ID must be a valid MongoDB ObjectId',
				}),
		}),
	},

	// Change password
	changePassword: {
		body: Joi.object({
			currentPassword: Joi.string()
				.required()
				.messages({
					'any.required': 'Current password is required',
				}),
			newPassword: Joi.string()
				.min(6)
				.required()
				.messages({
					'any.required': 'New password is required',
				}),
		}),
		params: Joi.object({
			userId: Joi.string()
				.pattern(/^[0-9a-fA-F]{24}$/)
				.required(),
		}),
	},

	// Get user by ID
	getUserById: {
		params: Joi.object({
			userId: Joi.string()
				.pattern(/^[0-9a-fA-F]{24}$/)
				.required()
				.messages({
					'string.pattern.base': 'User ID must be a valid MongoDB ObjectId',
				}),
		}),
	},

	// Pagination and search
	paginationQuery: {
		query: Joi.object({
			page: Joi.number()
				.integer()
				.min(1)
				.default(1)
				.optional(),
			limit: Joi.number()
				.integer()
				.min(1)
				.max(100)
				.default(10)
				.optional(),
			search: Joi.string()
				.trim()
				.max(100)
				.optional(),
			sortBy: Joi.string()
				.valid('name', 'username', 'email', 'createdAt', 'lastLogin')
				.default('createdAt')
				.optional(),
			sortOrder: Joi.string()
				.valid('asc', 'desc')
				.default('desc')
				.optional(),
		}),
	},
};

// Quick validation helpers for common cases
export const validateRegister = validate(validationSchemas.register);
export const validateLogin = validate(validationSchemas.login);
export const validateRefreshToken = validate(validationSchemas.refreshToken);
export const validateUpdateProfile = validate(validationSchemas.updateProfile);
export const validateChangePassword = validate(validationSchemas.changePassword);
export const validateGetUserById = validate(validationSchemas.getUserById);
export const validatePagination = validate(validationSchemas.paginationQuery);