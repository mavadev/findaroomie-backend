import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
			trim: true,
		},
		lastName: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			select: false,
		},

		phone: {
			type: String,
			trim: true,
			default: '',
		},
		dni: {
			type: String,
			trim: true,
			default: '',
		},
		age: {
			type: Number,
			default: null,
		},
		district: {
			type: String,
			trim: true,
			default: '',
		},
		occupation: {
			type: String,
			trim: true,
			default: '',
		},
		bio: {
			type: String,
			trim: true,
			default: '',
		},
		profileImage: {
			url: {
				type: String,
				default: '',
			},
			publicId: {
				type: String,
				default: '',
			},
		},
		preferences: {
			lookingFor: {
				type: [String],
				default: [],
			},
			notComfortableWith: {
				type: [String],
				default: [],
			},
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		identityVerificationStatus: {
			type: String,
			enum: ['not_submitted', 'pending', 'approved', 'rejected'],
			default: 'not_submitted',
		},
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	},
);

const User = mongoose.model('User', userSchema);

export default User;
