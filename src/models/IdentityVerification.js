import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
	{
		url: {
			type: String,
			required: true,
		},
		publicId: {
			type: String,
			required: true,
		},
	},
	{ _id: false },
);

const identityVerificationSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true,
		},
		dni: {
			type: String,
			required: true,
			trim: true,
		},
		dniFrontImage: {
			type: imageSchema,
			required: true,
		},
		selfieWithDniImage: {
			type: imageSchema,
			required: true,
		},
		status: {
			type: String,
			enum: ['pending', 'approved', 'rejected'],
			default: 'pending',
		},
		adminComment: {
			type: String,
			trim: true,
			default: '',
		},
		reviewedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	},
);

const IdentityVerification = mongoose.model('IdentityVerification', identityVerificationSchema);

export default IdentityVerification;
