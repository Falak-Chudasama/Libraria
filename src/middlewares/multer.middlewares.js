import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import winstonLogger from '../utils/logger.utils.js';

dotenv.config();
const maxMB = process.env.IMAGE_FILE_LIMIT || 5;

const mkdIfNull = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        winstonLogger.info(`Directory ${dir} now exists and resolved`);
    }
};

const getFileName = (req, file, cb) => {
    const imageType = req.get('imageType');
    if (!imageType) {
        winstonLogger.error('No image type mentioned');
        cb(new Error('No image type mentioned'));
    }
    if (imageType !== 'profile' && imageType !== 'dashboard' && imageType !== 'cover') {
        winstonLogger.error('Invalid image type mentioned');
        cb(new Error('Invalid image type mentioned'));
    }
    const ext = path.extname(file.originalname);
    let fileName;
    if (imageType === 'profile' || imageType === 'dashboard') {
        const { username } = req.user;
        fileName = username + '-' + imageType + ext;
        winstonLogger.info(`${imageType} image of a user with username ${username} is being stored as file ${fileName}`);
    } else {
        const { title } = req.body;
        const sanitizedBookTitle = title.replace(/[^a-zA-Z0-9\-\_]/g, '').toLowerCase();
        fileName = sanitizedBookTitle + ext;
        winstonLogger.info(`Cover image of a book with title ${title} is being stored as file ${fileName}`);
    }
    winstonLogger.info(fileName) // del
    return fileName;
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const imageType = req.get('imageType');

        winstonLogger.info('multer was called') // del

        if (!imageType) {
            winstonLogger.error('No image type mentioned');
            cb(new Error('No image type mentioned'));
        }
        if (imageType !== 'profile' && imageType !== 'dashboard' && imageType !== 'cover') {
            winstonLogger.error('Invalid image type mentioned');
            cb(new Error('Invalid image type mentioned'));
        }
        let folder = path.resolve('uploads');
        if (imageType === 'profile' || imageType === 'dashboard') {
            folder = path.join(folder, 'users');
        } else {
            folder = path.join(folder, 'books');
        }

        mkdIfNull(folder);
        winstonLogger.info(`Saving file to folder: ${folder}`);
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        try {
            const fileName = getFileName(req, file, cb);
            cb(null, fileName);
        } catch (err) {
            cb(err);
        }
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFiles = ['image/jpg', 'image/png', 'image/jpeg'];
    winstonLogger.info('multer was used');
    if (allowedFiles.includes(file.mimetype)) {
        winstonLogger.info(`File type "${file.mimetype}" is allowed.`);
        cb(null, true);
    } else {
        const errorMsg = `Unsupported file type: ${file.mimetype}. Allowed types: jpg, png, jpeg.`;
        winstonLogger.error(errorMsg);
        cb(new Error(errorMsg));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: maxMB * 1024 * 1024 },
    fileFilter
});

export default upload;