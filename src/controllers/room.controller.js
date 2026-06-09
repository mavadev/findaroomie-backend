import Room from '../models/Room.js';

export const createRoom = async(req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      bedroomCount,
      bathroomCount,
      area,
      services,
      amenities,
      houseRules,
      livingPreferences,
    } = req.body;

    if (!title ||
      !description ||
      price === undefined ||
      !location?.district ||
      !location?.address ||
      !bedroomCount ||
      !bathroomCount
    ) {
      return res.status(400).json({
        message: 'Completa los campos obligatorios de la habitación',
      });
    }

    const room = await Room.create({
      ownerId: req.user._id,
      title,
      description,
      price,
      location,
      bedroomCount,
      bathroomCount,
      area,
      services,
      amenities,
      houseRules,
      livingPreferences,
    });

    res.status(201).json({
      message: 'Habitación publicada correctamente',
      room,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al publicar habitación',
      error: error.message,
    });
  }
};