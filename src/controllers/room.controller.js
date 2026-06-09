import Room from '../models/Room.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';
import { CLOUDINARY_FOLDERS } from '../constants/cloudinaryFolders.js';

export const createRoom = async (req, res) => {
	try {
		const {
			title,
			description,
			price,
			location,
			bedroomCount,
			bathroomCount,
			area,
			services,
			amenities,
			houseRules,
			livingPreferences,
		} = req.body;

		if (
			!title ||
			!description ||
			price === undefined ||
			!location?.district ||
			!location?.address ||
			!bedroomCount ||
			!bathroomCount
		) {
			return res.status(400).json({
				message: 'Completa los campos obligatorios de la habitación',
			});
		}

		const room = await Room.create({
			ownerId: req.user._id,
			title,
			description,
			price,
			location,
			bedroomCount,
			bathroomCount,
			area,
			services,
			amenities,
			houseRules,
			livingPreferences,
		});

		res.status(201).json({
			message: 'Habitación publicada correctamente',
			room,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al publicar habitación',
			error: error.message,
		});
	}
};

export const uploadRoomImages = async (req, res) => {
	try {
		const { id } = req.params;

		const room = await Room.findById(id);

		if (!room) {
			return res.status(404).json({
				message: 'Habitación no encontrada',
			});
		}

		if (room.ownerId.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				message: 'No tienes permiso para modificar esta habitación',
			});
		}

		if (!req.files || req.files.length === 0) {
			return res.status(400).json({
				message: 'Debes subir al menos una imagen',
			});
		}

		const uploadedImages = [];

		for (const file of req.files) {
			const result = await uploadToCloudinary(file.buffer, CLOUDINARY_FOLDERS.ROOMS.IMAGES);

			const optimizedImageUrl = result.secure_url.replace('/upload/', '/upload/c_scale,w_1200/f_auto/q_auto/');

			uploadedImages.push({
				url: optimizedImageUrl,
				publicId: result.public_id,
			});
		}

		room.images.push(...uploadedImages);

		await room.save();

		res.json({
			message: 'Imágenes de habitación subidas correctamente',
			images: room.images,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al subir imágenes de habitación',
			error: error.message,
		});
	}
};

export const getRooms = async (req, res) => {
	try {
		const rooms = await Room.find({ isAvailable: true })
			.populate('ownerId', 'firstName lastName profileImage identityVerificationStatus')
			.sort({ createdAt: -1 });

		res.json({
			message: 'Habitaciones obtenidas correctamente',
			total: rooms.length,
			rooms,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al obtener habitaciones',
			error: error.message,
		});
	}
};

export const getRoomById = async (req, res) => {
	try {
		const { id } = req.params;

		const room = await Room.findById(id).populate(
			'ownerId',
			'firstName lastName email phone profileImage identityVerificationStatus',
		);

		if (!room) {
			return res.status(404).json({
				message: 'Habitación no encontrada',
			});
		}

		res.json({
			message: 'Habitación obtenida correctamente',
			room,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al obtener habitación',
			error: error.message,
		});
	}
};
