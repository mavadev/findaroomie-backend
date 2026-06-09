import Room from '../models/Room.js';
import District from '../models/District.js';
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
			!location?.districtId ||
			!location?.address ||
			!bedroomCount ||
			!bathroomCount
		) {
			return res.status(400).json({
				message: 'Completa los campos obligatorios de la habitación',
			});
		}

		const district = await District.findById(location.districtId);

		if (!district || !district.isActive) {
			return res.status(400).json({
				message: 'El distrito seleccionado no es válido',
			});
		}

		const room = await Room.create({
			ownerId: req.user._id,
			title,
			description,
			price,
			location: {
				district: {
					id: district._id,
					name: district.name,
				},
				address: location.address,
				reference: location.reference || '',
				coordinates: location.coordinates || {
					lat: null,
					lng: null,
				},
			},
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
		const { district, minPrice, maxPrice, internet, water, electricity, gas, parking } = req.query;

		const filters = {
			isAvailable: true,
		};

		if (district) {
      filters['location.district.id'] = district;
    }
		
		if (minPrice || maxPrice) {
			filters.price = {};

			if (minPrice) {
				filters.price.$gte = Number(minPrice);
			}

			if (maxPrice) {
				filters.price.$lte = Number(maxPrice);
			}
		}

		if (internet !== undefined) {
			filters['services.internet'] = internet === 'true';
		}

		if (water !== undefined) {
			filters['services.water'] = water === 'true';
		}

		if (electricity !== undefined) {
			filters['services.electricity'] = electricity === 'true';
		}

		if (gas !== undefined) {
			filters['services.gas'] = gas === 'true';
		}

		if (parking !== undefined) {
			filters['services.parking'] = parking === 'true';
		}

		const rooms = await Room.find(filters)
			.populate(
				'ownerId',
				'firstName lastName profileImage identityVerificationStatus'
			)
			.sort({ createdAt: -1 });

		res.json({
			message: 'Habitaciones obtenidas correctamente',
			total: rooms.length,
			filters,
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
