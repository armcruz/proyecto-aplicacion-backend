import { Router } from 'express';
import userRoutes from './users.routes';
import authRoutes from './auth.routes';
import linksRoutes from './links.routes';
import filesRoutes from './files.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/links', linksRoutes);
router.use('/files', filesRoutes);

export default router;
