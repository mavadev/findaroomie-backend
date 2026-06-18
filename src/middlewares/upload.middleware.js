import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
	const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

	if (!allowedTypes.includes(file.mimetype)) {
		return cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'), false);
	}

	cb(null, true);
};

export const uploadImage = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 2 * 1024 * 1024,
	},
});
