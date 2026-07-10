import Request from '../models/Request.js';
import Room from '../models/Room.js';

export const createRequest = async (req, res) => {
	try {
		const { roomId, message } = req.body;

		if (!roomId) {
			return res.status(400).json({ message: 'El ID de la habitación es obligatorio' });
		}

		const room = await Room.findById(roomId);

		if (!room || room.isDeleted) {
			return res.status(404).json({ message: 'Habitación no encontrada' });
		}

		if (room.ownerId.toString() === req.user._id.toString()) {
			return res.status(400).json({ message: 'No puedes enviar una solicitud a tu propia habitación' });
		}

		const existing = await Request.findOne({ roomId, senderId: req.user._id });
		if (existing) {
			return res.status(400).json({ message: 'Ya enviaste una solicitud para esta habitación' });
		}

		const request = await Request.create({
			roomId,
			senderId: req.user._id,
			receiverId: room.ownerId,
			message: message || '',
		});

		res.status(201).json({ message: 'Solicitud enviada correctamente', request });
	} catch (error) {
		res.status(500).json({ message: 'Error al enviar solicitud', error: error.message });
	}
};

export const getSentRequests = async (req, res) => {
	try {
		const requests = await Request.find({ senderId: req.user._id })
			.populate('roomId', 'title location images price isDeleted')
			.populate('receiverId', 'firstName lastName profileImage phone')
			.sort({ createdAt: -1 })
			.lean();

		const safeRequests = requests.map(request => {
			if (request.status !== 'accepted' && request.receiverId) {
				return {
					...request,
					receiverId: {
						...request.receiverId,
						phone: '',
					},
				};
			}

			return request;
		});

		res.json({
			message: 'Solicitudes enviadas obtenidas',
			total: safeRequests.length,
			requests: safeRequests,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al obtener solicitudes enviadas',
			error: error.message,
		});
	}
};

export const getReceivedRequests = async (req, res) => {
	try {
		const requests = await Request.find({ receiverId: req.user._id })
			.populate('roomId', 'title location images price isDeleted')
			.populate('senderId', 'firstName lastName profileImage identityVerificationStatus phone')
			.sort({ createdAt: -1 })
			.lean();

		const safeRequests = requests.map(request => {
			if (request.status !== 'accepted' && request.senderId) {
				return {
					...request,
					senderId: {
						...request.senderId,
						phone: '',
					},
				};
			}

			return request;
		});

		res.json({
			message: 'Solicitudes recibidas obtenidas',
			total: safeRequests.length,
			requests: safeRequests,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al obtener solicitudes recibidas',
			error: error.message,
		});
	}
};

export const updateRequestStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		if (!['accepted', 'rejected'].includes(status)) {
			return res.status(400).json({ message: 'Estado inválido. Usa "accepted" o "rejected"' });
		}

		const request = await Request.findById(id);

		if (!request) {
			return res.status(404).json({ message: 'Solicitud no encontrada' });
		}

		if (request.receiverId.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'No tienes permiso para modificar esta solicitud' });
		}

		if (request.status !== 'pending') {
			return res.status(400).json({ message: 'Esta solicitud ya fue procesada' });
		}

		request.status = status;
		await request.save();

		res.json({ message: 'Estado de solicitud actualizado', request });
	} catch (error) {
		res.status(500).json({ message: 'Error al actualizar solicitud', error: error.message });
	}
};
