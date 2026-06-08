import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';
import { deleteFromCloudinary } from '../utils/deleteFromCloudinary.js';

export const getMe = async(req, res) => {
  res.json({
    message: 'Perfil obtenido correctamente',
    user: {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      phone: req.user.phone,
      dni: req.user.dni,
      age: req.user.age,
      district: req.user.district,
      occupation: req.user.occupation,
      bio: req.user.bio,
      profileImage: req.user.profileImage,
      preferences: req.user.preferences,
      isEmailVerified: req.user.isEmailVerified,
      identityVerificationStatus: req.user.identityVerificationStatus,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    },
  });
};

export const updateMe = async(req, res) => {
  try {
    const allowedFields = ['phone', 'age', 'district', 'occupation', 'bio'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        req.user[field] = req.body[field];
      }
    });

    await req.user.save();

    res.json({
      message: 'Perfil actualizado correctamente',
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
        dni: req.user.dni,
        age: req.user.age,
        district: req.user.district,
        occupation: req.user.occupation,
        bio: req.user.bio,
        profileImage: req.user.profileImage,
        preferences: req.user.preferences,
        isEmailVerified: req.user.isEmailVerified,
        identityVerificationStatus: req.user.identityVerificationStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar perfil',
      error: error.message,
    });
  }
};

export const updatePreferences = async(req, res) => {
  try {
    const { lookingFor, notComfortableWith } = req.body;

    if (!Array.isArray(lookingFor) || !Array.isArray(notComfortableWith)) {
      return res.status(400).json({
        message: 'Las preferencias deben enviarse como listas de texto',
      });
    }

    req.user.preferences = {
      lookingFor,
      notComfortableWith,
    };

    await req.user.save();

    res.json({
      message: 'Preferencias actualizadas correctamente',
      preferences: req.user.preferences,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar preferencias',
      error: error.message,
    });
  }
};

export const updateProfileImage = async(req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'La imagen de perfil es obligatoria',
      });
    }

    if (req.user.profileImage?.publicId) {
      await deleteFromCloudinary(req.user.profileImage.publicId);
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      'findaroomie/users/profile-images'
    );

    const optimizedImageUrl = result.secure_url.replace(
      '/upload/',
      '/upload/c_fill,w_400,h_400,g_face/f_auto/q_auto/'
    );

    req.user.profileImage = {
      url: optimizedImageUrl,
      publicId: result.public_id,
    };

    await req.user.save();

    res.json({
      message: 'Foto de perfil actualizada correctamente',
      profileImage: req.user.profileImage
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar foto de perfil',
      error: error.message,
    });
  }
};