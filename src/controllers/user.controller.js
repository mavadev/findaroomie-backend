export const getMe = async (req, res) => {
	res.json({
		message: 'Perfil obtenido correctamente',
		user: {
			id: req.user._id,
			firstName: req.user.firstName,
			lastName: req.user.lastName,
			email: req.user.email,
			phone: req.user.phone,
			dni: req.user.dni,
			age: req.user.age,
			district: req.user.district,
			occupation: req.user.occupation,
			bio: req.user.bio,
			profileImage: req.user.profileImage,
			preferences: req.user.preferences,
			isEmailVerified: req.user.isEmailVerified,
			identityVerificationStatus: req.user.identityVerificationStatus,
			createdAt: req.user.createdAt,
			updatedAt: req.user.updatedAt,
		},
	});
};
