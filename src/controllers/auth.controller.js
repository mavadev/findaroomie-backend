import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const registerUser = async(req, res) => {
  try {
    const { nombres, apellidos, email, password } = req.body;

    if (!nombres || !apellidos || !email || !password) {
      return res.status(400).json({
        message: 'Todos los campos obligatorios deben completarse',
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(409).json({
        message: 'El correo ya está registrado',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      nombres,
      apellidos,
      email,
      password: passwordHash,
    });

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: {
        id: newUser._id,
        nombres: newUser.nombres,
        apellidos: newUser.apellidos,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al registrar usuario',
      error: error.message,
    });
  }
};