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

export const updateMe = async (req, res) => {
	try {
		const allowedFields = ['phone', 'age', 'district', 'occupation', 'bio'];

		allowedFields.forEach(field => {
			if (req.body[field] !== undefined) {
				req.user[field] = req.body[field];
			}
		});

		await req.user.save();

		res.json({
			message: 'Perfil actualizado correctamente',
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
			},
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al actualizar perfil',
			error: error.message,
		});
	}
};
