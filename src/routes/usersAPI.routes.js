import { Router } from 'express';
import authenticateToken from '../middlewares/jwt.middlewares.js';
import { addUserOne } from '../controllers/users.controller.js';
import { findUsers, findUserByUsername, findUserByEmail, findUserByMobileNo, findOtherUser, findOtherUsers } from '../controllers/users.controller.js';
import { updateUploadImage, updateUserBorrowsBook, updateUserReturnsBook } from '../controllers/users.controller.js';
import { deleteUser } from '../controllers/users.controller.js';
import upload from '../middlewares/multer.middlewares.js';

const usersAPIRouter = Router();
usersAPIRouter.use(authenticateToken);

// POST /api/users
usersAPIRouter.post('/', addUserOne);

// GET /api/users
usersAPIRouter.get('/', findUserByUsername);
usersAPIRouter.get('/all', findUsers);
usersAPIRouter.get('/allOther', findOtherUsers);
usersAPIRouter.get('/email/:email', findUserByEmail);
usersAPIRouter.get('/mobileNo/:mobileNo', findUserByMobileNo);
usersAPIRouter.get('/:username', findOtherUser);

// PATCH /api/users
usersAPIRouter.patch('/profileImage', upload.single('profile'), updateUploadImage);
usersAPIRouter.patch('/dashboardImage', upload.single('dashboard'), updateUploadImage);
usersAPIRouter.patch('/borrows', updateUserBorrowsBook);
usersAPIRouter.patch('/returns', updateUserReturnsBook);

// DELETE /api/users
usersAPIRouter.delete('/', deleteUser);


export default usersAPIRouter;