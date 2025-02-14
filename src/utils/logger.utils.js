import winston from "winston";
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const winstonLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, timestamp, message }) => {
            return `[${timestamp}]  ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, '../../application.log'),
            level: 'info'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../../errors.log'),
            level: 'error'
        }),
        // new winston.transports.Console()
    ]
});

export default winstonLogger;