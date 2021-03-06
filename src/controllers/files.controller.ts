import path from 'path';
import fs from 'fs';
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';
import Link from '../models/Link';

export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
	const storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, path.join(__dirname, '..', 'uploads'));
		},
		filename: function (req, file, cb) {
			const ext = path.extname(file.originalname);
			cb(null, nanoid() + ext);
		},
	});

	// Límite 50MB
	const fileSize = 1024 * 1024 * 50;

	const multerConfig = {
		limits: { fileSize },
		storage,
	};

	const upload = multer(multerConfig).single('file');

	upload(req, res, (err: any) => {
		if (err) {
			console.log(err);
			return next(err);
		}
		return res.json({ success: true, file: req.file.filename });
	});
};

export const deleteFile = (req: Request, res: Response) => {
	const { id } = req.params;
	console.log('existe id:', id);
	const filePath = path.join(__dirname, '..', 'uploads', req.fileName);

	fs.stat(filePath, (err: NodeJS.ErrnoException | null, stats: fs.Stats) => {
		if (err) {
			console.log('error: ', err);
			return;
		}
		if (!stats) {
			console.log('El archivo ya no existe');
			return;
		}
		fs.unlink(filePath, (err: NodeJS.ErrnoException | null) => {
			if (err) {
				console.log('Error al eliminar el archivo:', err);
				return;
			}
			console.log('Archivo eliminado');
		});
	});
};

export const downloadFile = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { file } = req.params;
	const filePath = `${path.join(__dirname, '..', 'uploads')}/${file}`;
	res.download(filePath);
	try {
		const link = await Link.findOne({ nombre: file });
		if (!link) {
			return next();
		}
		if (link.descargas === 1) {
			req.fileName = file;
			req.originalname = link.nombreOriginal;
			await Link.findByIdAndDelete(link.id);
			return next();
		} else {
			link.descargas = link.descargas - 1;
			await link.save();
			return next();
		}
	} catch (err) {
		return next(err);
	}
};

export const existsFile = (req: Request, res: Response) => {
	const { file } = req.params;
	const filePath = `${path.join(__dirname, '..', 'uploads')}/${file}`;
	fs.stat(filePath, (err: NodeJS.ErrnoException | null, stats: fs.Stats) => {
		if (err) {
			console.log('error de verificación: ', err);
			return res.status(500).json({
				success: false,
				msg: 'El archivo ya no está disponible',
			});
		}
		if (!stats) {
			console.log('El archivo ya no está disponible');
			return res.status(404).json({
				success: false,
				msg: 'El archivo ya no está disponible',
			});
		}
		return res.json({ success: true, msg: 'El archivo está disponible' });
	});
};
