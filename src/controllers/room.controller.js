import Room from '../models/Room.js';
import District from '../models/District.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';
import { deleteFromCloudinary } from '../utils/deleteFromCloudinary.js';
import { CLOUDINARY_FOLDERS } from '../constants/cloudinaryFolders.js';

export const createRoom = async (req, res) => {
  try {
    const { title, description, price, location, bedroomCount, bathroomCount, area, services, amenities, houseRules, livingPreferences } = req.body;
    if (!title || !description || price === undefined || !location?.districtId || !location?.address || !bedroomCount || !bathroomCount) {
      return res.status(400).json({ message: 'Completa los campos obligatorios de la habitación' });
    }
    const district = await District.findById(location.districtId);
    if (!district || !district.isActive) {
      return res.status(400).json({ message: 'El distrito seleccionado no es válido' });
    }
    const room = await Room.create({
      ownerId: req.user._id,
      title, description, price,
      location: {
        district: { id: district._id, name: district.name },
        address: location.address,
        reference: location.reference || '',
        coordinates: location.coordinates || { lat: null, lng: null },
      },
      bedroomCount, bathroomCount, area, services, amenities, houseRules, livingPreferences,
    });
    res.status(201).json({ message: 'Habitación publicada correctamente', room });
  } catch (error) {
    res.status(500).json({ message: 'Error al publicar habitación', error: error.message });
  }
};

export const uploadRoomImages = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ message: 'Habitación no encontrada' });
    if (room.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para modificar esta habitación' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Debes subir al menos una imagen' });
    }
    const uploadedImages = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, CLOUDINARY_FOLDERS.ROOMS.IMAGES);
      const optimizedImageUrl = result.secure_url.replace('/upload/', '/upload/c_scale,w_1200/f_auto/q_auto/');
      uploadedImages.push({ url: optimizedImageUrl, publicId: result.public_id });
    }
    room.images.push(...uploadedImages);
    await room.save();
    res.json({ message: 'Imágenes de habitación subidas correctamente', images: room.images });
  } catch (error) {
    res.status(500).json({ message: 'Error al subir imágenes de habitación', error: error.message });
  }
};

export const deleteRoomImage = async (req, res) => {
  try {
    const { id, publicId } = req.params;
    const room = await Room.findById(id);
    if (!room || room.isDeleted) return res.status(404).json({ message: 'Habitación no encontrada' });
    if (room.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para modificar esta habitación' });
    }
    const decodedPublicId = decodeURIComponent(publicId);
    const imageIndex = room.images.findIndex(img => img.publicId === decodedPublicId);
    if (imageIndex === -1) return res.status(404).json({ message: 'Imagen no encontrada en esta habitación' });
    await deleteFromCloudinary(decodedPublicId);
    room.images.splice(imageIndex, 1);
    await room.save();
    res.json({ message: 'Imagen eliminada correctamente', images: room.images });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar imagen', error: error.message });
  }
};

export const submitRoomVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room || room.isDeleted) return res.status(404).json({ message: 'Habitación no encontrada' });
    if (room.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para verificar esta habitación' });
    }
    if (room.verificationStatus === 'pending') {
      return res.status(400).json({ message: 'Ya tienes una solicitud de verificación pendiente' });
    }
    if (room.verificationStatus === 'approved') {
      return res.status(400).json({ message: 'Esta habitación ya está verificada' });
    }
    if (!req.file) return res.status(400).json({ message: 'Debes adjuntar un recibo de luz o agua' });
    const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.ROOM_VERIFICATIONS.UTILITY_BILLS);
    room.verificationStatus = 'pending';
    room.verificationDocument = { url: result.secure_url, publicId: result.public_id };
    await room.save();
    res.json({ message: 'Solicitud de verificación enviada correctamente', room });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar verificación', error: error.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const { district, minPrice, maxPrice, internet, water, electricity, gas, parking } = req.query;
    const filters = { isAvailable: true, isDeleted: false };
    if (district) filters['location.district.id'] = district;
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }
    if (internet !== undefined) filters['services.internet'] = internet === 'true';
    if (water !== undefined) filters['services.water'] = water === 'true';
    if (electricity !== undefined) filters['services.electricity'] = electricity === 'true';
    if (gas !== undefined) filters['services.gas'] = gas === 'true';
    if (parking !== undefined) filters['services.parking'] = parking === 'true';
    const rooms = await Room.find(filters)
      .populate('ownerId', 'firstName lastName profileImage identityVerificationStatus')
      .sort({ createdAt: -1 });
    res.json({ message: 'Habitaciones obtenidas correctamente', total: rooms.length, filters, rooms });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener habitaciones', error: error.message });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id).populate('ownerId', 'firstName lastName email phone profileImage identityVerificationStatus');
    if (!room || room.isDeleted) return res.status(404).json({ message: 'Habitación no encontrada' });
    res.json({ message: 'Habitación obtenida correctamente', room });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener habitación', error: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room || room.isDeleted) return res.status(404).json({ message: 'Habitación no encontrada' });
    if (room.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para editar esta habitación' });
    }
    const { title, description, price, location, bedroomCount, bathroomCount, area, services, amenities, houseRules, livingPreferences, isAvailable } = req.body;
    if (title !== undefined) room.title = title;
    if (description !== undefined) room.description = description;
    if (price !== undefined) room.price = price;
    if (bedroomCount !== undefined) room.bedroomCount = bedroomCount;
    if (bathroomCount !== undefined) room.bathroomCount = bathroomCount;
    if (area !== undefined) room.area = area;
    if (services !== undefined) room.services = services;
    if (amenities !== undefined) room.amenities = amenities;
    if (houseRules !== undefined) room.houseRules = houseRules;
    if (livingPreferences !== undefined) room.livingPreferences = livingPreferences;
    if (isAvailable !== undefined) room.isAvailable = isAvailable;
    if (location !== undefined) {
      if (location.districtId !== undefined) {
        const district = await District.findById(location.districtId);
        if (!district || !district.isActive) return res.status(400).json({ message: 'El distrito seleccionado no es válido' });
        room.location.district = { id: district._id, name: district.name };
      }
      if (location.address !== undefined) room.location.address = location.address;
      if (location.reference !== undefined) room.location.reference = location.reference;
      if (location.coordinates !== undefined) room.location.coordinates = location.coordinates;
    }
    await room.save();
    res.json({ message: 'Habitación actualizada correctamente', room });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar habitación', error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room || room.isDeleted) return res.status(404).json({ message: 'Habitación no encontrada' });
    if (room.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta habitación' });
    }
    room.isDeleted = true;
    room.deletedAt = new Date();
    await room.save();
    res.json({ message: 'Habitación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar habitación', error: error.message });
  }
};

export const getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ ownerId: req.user._id, isDeleted: false }).sort({ createdAt: -1 });
    res.json({ message: 'Habitaciones del usuario obtenidas correctamente', total: rooms.length, rooms });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tus habitaciones', error: error.message });
  }
};
