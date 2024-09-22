import multer from 'multer';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { storage } from '../config/cloudinary.mjs';
import AppError from '../utils/appError.mjs';
import { findUserByIdService } from '../services/userService.mjs';

const multerFilter = (_req, file, cb) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true);
	} else {
		cb(new AppError('Not an image! Please upload only images.', 400), false);
	}
};

const upload = multer({ storage, fileFilter: multerFilter });

export const uploadPhotoMiddleware = upload.single('photo');

export const restrictRouteMiddleware =
	(...roles) =>
	(req, _res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError('You do not have permission to perform this action.', 403),
			);
		}
		next();
	};

export const protectRoutetMiddleware = async (req, _res, next) => {
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}
	if (!token)
		return next(
			new AppError('You are not logged in! Please login to get access.', 401),
		);
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
	const { user: freshUser } = await findUserByIdService(decoded.id);
	if (!freshUser)
		return next(
			new AppError(
				'The user belonging to this token dose no longer exist.',
				401,
			),
		);
	if (freshUser.changedPasswordAfter(decoded.iat)) {
		return next(
			new AppError('User recently changed password! Please login again.', 401),
		);
	}
	req.user = freshUser;
	next();
};

export const aliasTopToursMiddleware = (req, _res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
};

export const setContractIdToTiersMiddleware = (req, _res, next) => {
	if (!req.body.contract) req.body.contract = req.params.contractId;
	next();
};
export const setPlanIdToPerksMiddleware = (req, _res, next) => {
	if (!req.body.plan) req.body.plan = req.params.planId;
	next();
};

export const setUserIdToContractsMiddleware = (req, _res, next) => {
	if (!req.body.user) req.body.user = req.user._id;
	next();
};

export const getMeMiddleware = (req, _res, next) => {
	req.params.id = req.user.id;
	next();
};

export const setPhotoPathToBodyMiddleware = (req, _res, next) => {
	if (req.file) req.body.photo = req.file.path;
	if (!req.body.photo)
		return next(new AppError('Please provide a photo.', 400));
	next();
};
