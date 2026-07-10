import User from '../models/User.js';
import IdentityVerification from '../models/IdentityVerification.js';
import Report from '../models/Report.js';
import Room from '../models/Room.js';

// ── Verificaciones de identidad ────────────────────────────────────────────
export const getIdentityVerifications = async (req, res) => {
	try {
		const { status } = req.query;
		const filter = status ? { status } : {};

		const verifications = await IdentityVerification.find(filter)
			.populate('userId', 'firstName lastName email identityVerificationStatus')
			.sort({ createdAt: -1 });

		res.json({ message: 'Verificaciones de identidad obtenidas', total: verifications.length, verifications });
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener verificaciones', error: error.message });
	}
};

export const updateIdentityVerificationStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status, adminComment } = req.body;

		if (!['approved', 'rejected'].includes(status)) {
			return res.status(400).json({ message: 'Estado inválido. Usa "approved" o "rejected"' });
		}

		const verification = await IdentityVerification.findById(id);

		if (!verification) {
			return res.status(404).json({ message: 'Verificación no encontrada' });
		}

		verification.status = status;
		verification.adminComment = adminComment || '';
		verification.reviewedAt = new Date();
		await verification.save();

		// Sincronizar estado en el usuario
		await User.findByIdAndUpdate(verification.userId, {
			identityVerificationStatus: status,
		});

		res.json({ message: 'Verificación actualizada', verification });
	} catch (error) {
		res.status(500).json({ message: 'Error al actualizar verificación', error: error.message });
	}
};

// ── Reportes ───────────────────────────────────────────────────────────────
export const getAdminReports = async (req, res) => {
	try {
		const { status } = req.query;
		const filter = status ? { status } : {};

		const reports = await Report.find(filter)
			.populate('reporterId', 'firstName lastName email')
			.populate('reportedUserId', 'firstName lastName email isActive')
			.populate('reportedRoomId', 'title location')
			.sort({ createdAt: -1 });

		res.json({ message: 'Reportes obtenidos', total: reports.length, reports });
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener reportes', error: error.message });
	}
};

export const updateReportStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status, adminComment } = req.body;

		if (!['reviewed', 'dismissed'].includes(status)) {
			return res.status(400).json({ message: 'Estado inválido. Usa "reviewed" o "dismissed"' });
		}

		const report = await Report.findById(id);

		if (!report) {
			return res.status(404).json({ message: 'Reporte no encontrado' });
		}

		report.status = status;
		report.adminComment = adminComment || '';
		report.reviewedAt = new Date();
		await report.save();

		res.json({ message: 'Reporte actualizado', report });
	} catch (error) {
		res.status(500).json({ message: 'Error al actualizar reporte', error: error.message });
	}
};

// ── Usuarios ───────────────────────────────────────────────────────────────
export const getUsers = async (req, res) => {
	try {
		const users = await User.find().sort({ createdAt: -1 });
		res.json({ message: 'Usuarios obtenidos', total: users.length, users });
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
	}
};

export const updateUserStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { isActive } = req.body;

		if (typeof isActive !== 'boolean') {
			return res.status(400).json({ message: 'isActive debe ser true o false' });
		}

		const user = await User.findByIdAndUpdate(id, { isActive }, { new: true });

		if (!user) {
			return res.status(404).json({ message: 'Usuario no encontrado' });
		}

		res.json({ message: `Usuario ${isActive ? 'activado' : 'desactivado'}`, user });
	} catch (error) {
		res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
	}
};

// ── Verificaciones de habitación ───────────────────────────────────────────
export const getRoomVerifications = async (req, res) => {
	try {
		const { status } = req.query;
		const filter = { isDeleted: false };
		if (status) filter.verificationStatus = status;

		const rooms = await Room.find(filter).populate('ownerId', 'firstName lastName email').sort({ createdAt: -1 });

		res.json({ message: 'Habitaciones para verificar obtenidas', total: rooms.length, rooms });
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener habitaciones', error: error.message });
	}
};

export const updateRoomVerificationStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status, adminComment } = req.body;

		if (!['approved', 'rejected'].includes(status)) {
			return res.status(400).json({ message: 'Estado inválido. Usa "approved" o "rejected"' });
		}

		const room = await Room.findById(id);
		if (!room || room.isDeleted) {
			return res.status(404).json({ message: 'Habitación no encontrada' });
		}

		room.verificationStatus = status;
		if (adminComment) room.adminComment = adminComment;
		await room.save();

		res.json({ message: 'Estado de verificación de habitación actualizado', room });
	} catch (error) {
		res.status(500).json({ message: 'Error al actualizar verificación', error: error.message });
	}
};
