import dotenv from 'dotenv';
import connectDB from "./db/config.js";
import app from './app/app.js';
import winstonLogger from './utils/logger.utils.js';

dotenv.config();
const port = process.env.PORT;

// TODO: Process the records and then filter out the dead records

app.listen(port, async () => {
    try {
        await connectDB();
    } catch(err) {
        console.log(err);
    }
    winstonLogger.info('Server is Initialized');
    console.log(`Server is running at -> http://localhost:${port}`);
});