import mongoose from 'mongoose';
import dotenv from 'dotenv';
import winstonLogger from '../utils/logger.utils.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        winstonLogger.info('Database Connected');
    } catch (err) {
        winstonLogger.error('Error while connecting DataBase - ' + err);
        throw new Error('Error while connecting DataBase - ' + err);
    }
};

export default connectDB;