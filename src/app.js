import express from 'express';
import cors from 'cors';
import indexRoutes from './routes/index.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import identityVerificationRoutes from './routes/identityVerification.routes.js';
import roomRoutes from './routes/room.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/identity-verifications', identityVerificationRoutes);
app.use('/api/rooms', roomRoutes);

export default app;