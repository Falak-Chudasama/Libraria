import express from 'express';
import usersAPIRouter from '../routes/usersAPI.routes.js';
import usersAuthRouter from '../routes/usersAuth.routes.js';
import booksAPIRouter from '../routes/booksAPI.routes.js';
import recordsAPIRouter from '../routes/recordsAPI.routes.js';
import pageRouter from '../routes/pages.routes.js';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import morgan from 'morgan';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
app.use('/frontend', express.static(path.join(__dirname, '../../frontend')));

const accessLogger = fs.createWriteStream(
    path.join(__dirname,'../../access.log'),
    { flag: 'a' }
);
app.use(morgan('combined', { stream: accessLogger }));
app.use(morgan('dev'));

app.use('/api/users', usersAPIRouter);
app.use('/api/books', booksAPIRouter);
app.use('/api/records', recordsAPIRouter);

app.use('/auth', usersAuthRouter);

app.use('/', pageRouter);

export default app;