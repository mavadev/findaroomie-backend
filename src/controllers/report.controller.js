import Report from '../models/Report.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';
import { CLOUDINARY_FOLDERS } from '../constants/cloudinaryFolders.js';

export const createReport = async (req, res) => {
  try {
    const { reportedUserId, reportedRoomId, reason, description } = req.body;

    if (!reason || !description) {
      return res.status(400).json({ message: 'El motivo y la descripción son obligatorios' });
    }

    if (!reportedUserId && !reportedRoomId) {
      return res.status(400).json({ message: 'Debes indicar el usuario o habitación a reportar' });
    }

    // No reportarse a uno mismo
    if (reportedUserId && reportedUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'No puedes reportarte a ti mismo' });
    }

    let evidence = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.REPORTS.EVIDENCES);
      evidence = { url: result.secure_url, publicId: result.public_id };
    }

    const report = await Report.create({
      reporterId: req.user._id,
      reportedUserId: reportedUserId || null,
      reportedRoomId: reportedRoomId || null,
      reason,
      description,
      evidence,
    });

    res.status(201).json({ message: 'Reporte enviado correctamente', report });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar reporte', error: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'firstName lastName email')
      .populate('reportedUserId', 'firstName lastName email')
      .populate('reportedRoomId', 'title location')
      .sort({ createdAt: -1 });

    res.json({ message: 'Reportes obtenidos', total: reports.length, reports });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reportes', error: error.message });
  }
};
