import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  nombres: {
    type: String,
    required: true,
    trim: true,
  },
  apellidos: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  dni: {
    type: String,
    trim: true,
  },
  edad: {
    type: Number,
  },
  distrito: {
    type: String,
    trim: true,
  },
  ocupacion: {
    type: String,
    trim: true,
  },
  descripcion: {
    type: String,
    trim: true,
  },
  estadoVerificacion: {
    type: String,
    enum: ['pendiente', 'verificado', 'rechazado'],
    default: 'pendiente',
  },
}, {
  timestamps: true,
}, );

const User = mongoose.model('User', userSchema);

export default User;