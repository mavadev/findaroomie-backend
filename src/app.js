import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import indexRoutes from './routes/index.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import identityVerificationRoutes from './routes/identityVerification.routes.js';
import roomRoutes from './routes/room.routes.js';
import districtRoutes from './routes/district.routes.js';
import requestRoutes from './routes/request.routes.js';
import reportRoutes from './routes/report.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/identity-verifications', identityVerificationRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

export default app;
