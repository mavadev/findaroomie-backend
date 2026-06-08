import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({
				message: 'No autorizado, token no proporcionado',
			});
		}

		const token = authHeader.split(' ')[1];

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const user = await User.findById(decoded.id);

		if (!user || !user.isActive) {
			return res.status(401).json({
				message: 'No autorizado, usuario no válido',
			});
		}

		req.user = user;

		next();
	} catch (error) {
		return res.status(401).json({
			message: 'No autorizado, token inválido o expirado',
		});
	}
};
