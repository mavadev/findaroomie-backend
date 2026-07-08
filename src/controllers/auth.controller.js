import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import VerificationCode from '../models/VerificationCode.js';
import { validatePassword } from '../utils/validatePassword.js';
import { generateVerificationCode } from '../utils/generateVerificationCode.js';
import { generateToken } from '../utils/generateToken.js';
import { sendEmail } from '../utils/sendEmail.js';

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
			role: 'user',
		});

		const code = generateVerificationCode();

		await VerificationCode.create({
			userId: user._id,
			code,
			type: 'email_verification',
			expiresAt: new Date(Date.now() + 15 * 60 * 1000),
		});

		await sendEmail({
			to: user.email,
			subject: 'Verifica tu cuenta en FindARoomie',
			html: `
				<h2>Bienvenido a "Find a Roomie"</h2>
				<p>Tu código de verificación es:</p>
				<h1>${code}</h1>
				<p>Este código expira en 15 minutos.</p>
			`,
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
		});
	} catch (error) {
		console.log(error);
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
				role: user.role,
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

export const resendEmailVerificationCode = async (req, res) => {
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

		await sendEmail({
			to: user.email,
			subject: 'Nuevo código de verificación - Find A Roomie',
			html: `
				<h2>Verificación de correo</h2>
				<p>Tu nuevo código es:</p>
				<h1>${code}</h1>
				<p>Este código expira en 15 minutos.</p>
			`,
		});

		res.json({
			message: 'Código de verificación reenviado correctamente',
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al reenviar código de verificación',
			error: error.message,
		});
	}
};

export const resendPasswordResetCode = async (req, res) => {
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

		await VerificationCode.deleteMany({
			userId: user._id,
			type: 'password_reset',
		});

		const code = generateVerificationCode();

		await VerificationCode.create({
			userId: user._id,
			code,
			type: 'password_reset',
			expiresAt: new Date(Date.now() + 15 * 60 * 1000),
		});

		await sendEmail({
			to: user.email,
			subject: 'Nuevo código de recuperación - Find A Roomie',
			html: `
				<h2>Recuperación de contraseña</h2>
				<p>Tu nuevo código para restablecer tu contraseña es:</p>
				<h1>${code}</h1>
				<p>Este código expira en 15 minutos.</p>
			`,
		});

		res.json({
			message: 'Código de recuperación reenviado correctamente',
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al reenviar código de recuperación',
			error: error.message,
		});
	}
};

export const forgotPassword = async (req, res) => {
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
				message: 'No existe una cuenta con ese correo',
			});
		}

		await VerificationCode.deleteMany({
			userId: user._id,
			type: 'password_reset',
		});

		const code = generateVerificationCode();

		await VerificationCode.create({
			userId: user._id,
			code,
			type: 'password_reset',
			expiresAt: new Date(Date.now() + 15 * 60 * 1000),
		});

		await sendEmail({
			to: user.email,
			subject: 'Recuperación de contraseña - Find A Roomie',
			html: `
				<h2>Recuperación de contraseña</h2>
				<p>Tu código para restablecer tu contraseña es:</p>
				<h1>${code}</h1>
				<p>Este código expira en 15 minutos.</p>
			`,
		});

		res.json({
			message: 'Código de recuperación generado correctamente',
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al generar código de recuperación',
			error: error.message,
		});
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { email, code, newPassword } = req.body;

		if (!email || !code || !newPassword) {
			return res.status(400).json({
				message: 'Correo, código y nueva contraseña son obligatorios',
			});
		}

		const passwordError = validatePassword(newPassword);

		if (passwordError) {
			return res.status(400).json({
				message: passwordError,
			});
		}

		const user = await User.findOne({ email }).select('+password');

		if (!user) {
			return res.status(404).json({
				message: 'Usuario no encontrado',
			});
		}

		const verificationCode = await VerificationCode.findOne({
			userId: user._id,
			code,
			type: 'password_reset',
		});

		if (!verificationCode) {
			return res.status(400).json({
				message: 'Código inválido o expirado',
			});
		}

		const isSamePassword = await bcrypt.compare(newPassword, user.password);

		if (isSamePassword) {
			return res.status(400).json({
				message: 'La nueva contraseña no puede ser igual a la anterior',
			});
		}

		user.password = await bcrypt.hash(newPassword, 10);
		await user.save();

		await VerificationCode.deleteMany({
			userId: user._id,
			type: 'password_reset',
		});

		res.json({
			message: 'Contraseña actualizada correctamente',
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al restablecer contraseña',
			error: error.message,
		});
	}
};
