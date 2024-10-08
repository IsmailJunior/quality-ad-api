import { Router } from 'express';
import {
	getUserByIdController,
	getUsersController,
	deleteUserController,
	getMeController,
	updateMeController,
	deleteMeController,
} from '../controllers/userController.mjs';
import {
	protectRoutetMiddleware,
	getMeMiddleware,
	uploadPhotoMiddleware,
	uploadToCloudinaryMiddleware,
} from '../middlewares/middlewares.mjs';
import catchAsync from '../utils/catchAsync.mjs';

const router = Router();

router.use(catchAsync(protectRoutetMiddleware));

router.route('/').get(catchAsync(getUsersController));
router
	.route('/me')
	.get(getMeMiddleware, catchAsync(getMeController))
	.patch(
		uploadPhotoMiddleware,
		uploadToCloudinaryMiddleware,
		catchAsync(updateMeController),
	)
	.delete(catchAsync(deleteMeController));
router
	.route('/:id')
	.get(catchAsync(getUserByIdController))
	.delete(catchAsync(deleteUserController));

export default router;
