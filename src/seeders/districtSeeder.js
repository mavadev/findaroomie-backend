import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import District from '../models/District.js';

dotenv.config();

const districts = [
	'Ancón',
	'Ate',
	'Barranco',
	'Breña',
	'Carabayllo',
	'Chaclacayo',
	'Chorrillos',
	'Cieneguilla',
	'Comas',
	'El Agustino',
	'Independencia',
	'Jesús María',
	'La Molina',
	'La Victoria',
	'Lima',
	'Lince',
	'Los Olivos',
	'Lurigancho',
	'Lurín',
	'Magdalena del Mar',
	'Miraflores',
	'Pachacámac',
	'Pucusana',
	'Pueblo Libre',
	'Puente Piedra',
	'Punta Hermosa',
	'Punta Negra',
	'Rímac',
	'San Bartolo',
	'San Borja',
	'San Isidro',
	'San Juan de Lurigancho',
	'San Juan de Miraflores',
	'San Luis',
	'San Martín de Porres',
	'San Miguel',
	'Santa Anita',
	'Santa María del Mar',
	'Santa Rosa',
	'Santiago de Surco',
	'Surquillo',
	'Villa El Salvador',
	'Villa María del Triunfo',
];

const importDistricts = async () => {
	try {
		await connectDB();

		await District.deleteMany();

		await District.insertMany(
			districts.map(name => ({
				name,
				isActive: true,
			})),
		);

		console.log('Distritos importados correctamente');
		process.exit();
	} catch (error) {
		console.error('Error al importar distritos:', error.message);
		process.exit(1);
	}
};

importDistricts();
