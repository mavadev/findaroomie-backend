import District from '../models/District.js';

export const getDistricts = async (req, res) => {
	try {
		const districts = await District.find({ isActive: true }).sort({
			name: 1,
		});

		res.json({
			message: 'Distritos obtenidos correctamente',
			total: districts.length,
			districts,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al obtener distritos',
			error: error.message,
		});
	}
};
