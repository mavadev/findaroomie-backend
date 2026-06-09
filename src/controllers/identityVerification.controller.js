import IdentityVerification from '../models/IdentityVerification.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';
import { deleteFromCloudinary } from '../utils/deleteFromCloudinary.js';
import { CLOUDINARY_FOLDERS } from '../constants/cloudinaryFolders.js';

export const createIdentityVerification = async(req, res) => {
  try {
    const { dni } = req.body;

    if (!dni) {
      return res.status(400).json({
        message: 'El DNI es obligatorio',
      });
    }

    if (!req.files?.dniFrontImage || !req.files?.selfieWithDniImage) {
      return res.status(400).json({
        message: 'Debes subir la foto del DNI y la selfie con DNI',
      });
    }

    const existingVerification = await IdentityVerification.findOne({
      userId: req.user._id,
    });

    if (existingVerification && existingVerification.status === 'pending') {
      return res.status(400).json({
        message: 'Ya tienes una solicitud de verificación pendiente',
      });
    }

    if (existingVerification && existingVerification.status === 'approved') {
      return res.status(400).json({
        message: 'Tu identidad ya fue verificada',
      });
    }

    if (existingVerification) {
      await deleteFromCloudinary(existingVerification.dniFrontImage.publicId);
      await deleteFromCloudinary(existingVerification.selfieWithDniImage.publicId);

      await existingVerification.deleteOne();
    }

    const dniFrontUpload = await uploadToCloudinary(
      req.files.dniFrontImage[0].buffer,
      CLOUDINARY_FOLDERS.IDENTITY_VERIFICATIONS.DNI_FRONT,
    );

    const selfieUpload = await uploadToCloudinary(
      req.files.selfieWithDniImage[0].buffer,
      CLOUDINARY_FOLDERS.IDENTITY_VERIFICATIONS.SELFIES,
    );

    const verification = await IdentityVerification.create({
      userId: req.user._id,
      dni,
      dniFrontImage: {
        url: dniFrontUpload.secure_url,
        publicId: dniFrontUpload.public_id,
      },
      selfieWithDniImage: {
        url: selfieUpload.secure_url,
        publicId: selfieUpload.public_id,
      },
      status: 'pending',
    });

    req.user.dni = dni;
    req.user.identityVerificationStatus = 'pending';
    await req.user.save();

    res.status(201).json({
      message: 'Solicitud de verificación enviada correctamente',
      verification: {
        id: verification._id,
        dni: verification.dni,
        status: verification.status,
        dniFrontImage: verification.dniFrontImage,
        selfieWithDniImage: verification.selfieWithDniImage,
        createdAt: verification.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al enviar solicitud de verificación',
      error: error.message,
    });
  }
};