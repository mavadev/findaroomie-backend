import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import VerificationCode from '../models/VerificationCode.js';
import { validatePassword } from '../utils/validatePassword.js';
import { generateVerificationCode } from '../utils/generateVerificationCode.js';
import { generateToken } from '../utils/generateToken.js';

export const registerUser = async (req, res) => {
	try {
		const { firstName, lastName, email, password } = req.body;

		if (!firstName || !lastName || !email || !password) {
			return res.status(400).json({
				message: 'Todos los campos obligatorios deben completarse',
			});
		}

		const passwordError = validatePassword(password);

		if (passwordError) {
			return res.status(400).json({
				message: passwordError,
			});
		}

		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(409).json({
				message: 'El correo ya está registrado',
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await User.create({
			firstName,
			lastName,
			email,
			password: hashedPassword,
		});

		const code = generateVerificationCode();

		await VerificationCode.create({
			userId: user._id,
			code,
			type: 'email_verification',
			expiresAt: new Date(Date.now() + 15 * 60 * 1000),
		});

		res.status(201).json({
			message: 'Usuario registrado correctamente. Revisa tu correo para confirmar tu cuenta.',
			user: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				isEmailVerified: user.isEmailVerified,
				identityVerificationStatus: user.identityVerificationStatus,
			},
			devVerificationCode: code,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al registrar usuario',
			error: error.message,
		});
	}
};

export const verifyEmail = async (req, res) => {
	try {
		const { email, code } = req.body;

		if (!email || !code) {
			return res.status(400).json({
				message: 'El correo y el código son obligatorios',
			});
		}

		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({
				message: 'Usuario no encontrado',
			});
		}

		if (user.isEmailVerified) {
			return res.status(400).json({
				message: 'El correo ya fue verificado',
			});
		}

		const verificationCode = await VerificationCode.findOne({
			userId: user._id,
			code,
			type: 'email_verification',
		});

		if (!verificationCode) {
			return res.status(400).json({
				message: 'Código inválido o expirado',
			});
		}

		user.isEmailVerified = true;
		await user.save();

		await VerificationCode.deleteMany({
			userId: user._id,
			type: 'email_verification',
		});

		res.json({
			message: 'Correo verificado correctamente',
			user: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				isEmailVerified: user.isEmailVerified,
				identityVerificationStatus: user.identityVerificationStatus,
			},
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al verificar correo',
			error: error.message,
		});
	}
};

export const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				message: 'El correo y la contraseña son obligatorios',
			});
		}

		const user = await User.findOne({ email }).select('+password');

		if (!user) {
			return res.status(401).json({
				message: 'Credenciales inválidas',
			});
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return res.status(401).json({
				message: 'Credenciales inválidas',
			});
		}

		if (!user.isActive) {
			return res.status(403).json({
				message: 'La cuenta se encuentra desactivada',
			});
		}

		if (!user.isEmailVerified) {
			return res.status(403).json({
				message: 'Debes verificar tu correo antes de iniciar sesión',
			});
		}

		const token = generateToken(user._id);

		res.json({
			message: 'Inicio de sesión correcto',
			token,
			user: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				profileImage: user.profileImage,
				isEmailVerified: user.isEmailVerified,
				identityVerificationStatus: user.identityVerificationStatus,
			},
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al iniciar sesión',
			error: error.message,
		});
	}
};

export const resendVerificationCode = async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({
				message: 'El correo es obligatorio',
			});
		}

		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({
				message: 'Usuario no encontrado',
			});
		}

		if (user.isEmailVerified) {
			return res.status(400).json({
				message: 'El correo ya fue verificado',
			});
		}

		await VerificationCode.deleteMany({
			userId: user._id,
			type: 'email_verification',
		});

		const code = generateVerificationCode();

		await VerificationCode.create({
			userId: user._id,
			code,
			type: 'email_verification',
			expiresAt: new Date(Date.now() + 15 * 60 * 1000),
		});

		res.json({
			message: 'Código de verificación reenviado correctamente',
			devVerificationCode: code,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al reenviar código de verificación',
			error: error.message,
		});
	}
};
