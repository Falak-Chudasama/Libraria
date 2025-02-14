import { Router } from 'express';
import { loginUser, registerUser } from '../controllers/users.controller.js';
import { generateTokens, refreshToken } from '../middlewares/jwt.middlewares.js';

const usersAuthRouter = Router();

// POST /auth
usersAuthRouter.post('/register', registerUser);
usersAuthRouter.post('/login', loginUser);
usersAuthRouter.post('/refreshToken', refreshToken);
usersAuthRouter.post('/generateTokens', generateTokens);

export default usersAuthRouter;