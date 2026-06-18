import mongoose from 'mongoose';

const verificationCodeSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		code: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			enum: ['email_verification', 'password_reset'],
			required: true,
		},
		expiresAt: {
			type: Date,
			required: true,
			expires: 0,
		},
	},
	{
		timestamps: true,
	},
);

const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);

export default VerificationCode;
