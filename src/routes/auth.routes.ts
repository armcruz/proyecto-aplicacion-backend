import { Router } from 'express';
import { body } from 'express-validator';
import { checkErrors } from '../validations/check-errors';
import { login } from '../controllers/auth.controller';

const router = Router();

router.post(
	'/',
	[
		body('email', 'Agregue un email válido').isEmail(),
		body('password', 'La contraseña es obligatoria').not().isEmpty(),
		checkErrors,
	],
	login
);

export default router;
