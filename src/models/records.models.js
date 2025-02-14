import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { addToDate } from '../utils/dates.utils.js';

dotenv.config();

const minUsernameLength = 8;
const maxUsernameLength = 20;

const minTitleLength = 3;
const maxTitleLength = 50;

const RecordSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        minLength: [minUsernameLength, 'Username for Record must be at least ' + minUsernameLength + ' characters long'],
        maxLength: [maxUsernameLength, 'Username for Record should not exceed ' + maxUsernameLength + ' characters']
    },
    bookTitle: {
        type: String,
        trim: true,
        minLength: [minTitleLength, 'Title for Record must be at least ' + minTitleLength + ' characters long'],
        maxLength: [maxTitleLength, 'Title for Record should not exceed ' + maxTitleLength + ' characters']
    },
    bookWithUser: {
        type: Boolean,
        default: true,
    },
    timesBorrowed: {
        type: Number,
        default: 1,
    },
    borrowDates: {
        type: [Date],
        default: function () {
            return [Date.now()];
        }
    },
    deliveryDates: {
        type: [Date],
        default: function () {
            const borrowDate = this.borrowDates[this.borrowDates.length - 1] || Date.now();
            return addToDate(borrowDate.getTime(), process.env.DELIVERY_DATE_DELAY);
        }
    },
    dueDates: {
        type: [Date],
        required: [true, 'Due date is required']
    }
}, { timestamps: true });

RecordSchema.index({ username: 1, bookTitle: 1 }, { unique: true });

const Records = mongoose.model('Records', RecordSchema);

const allRecordFields = [
    'username', 'bookTitle', 'bookWithUser', 'timesBorrowed', 'borrowDate', 'deliveryDate', 'dueDate'
];

/* Input Object :
{
    "username": "arthur_morgan",
    "bookTitle": "Atomic Habits",
    "borrowDate": "2024-12-01T10:00:00.000Z",
    "deliveryDate": "2024-12-03T10:00:00.000Z",
    "dueDate": "2024-12-05T23:59:59.000Z"
}
*/

/* Final Object :
{
    "username": "arthur_morgan",
    "bookTitle": "Atomic Habits",
    "bookWithUser": true,
    "timesBorrowed": 1,
    "borrowDates": [
        "2024-12-01T10:00:00.000Z"
    ],
    "deliveryDates": [
        "2024-12-03T10:00:00.000Z"
    ],
    "dueDates": [
        "2024-12-02T23:59:59.000Z"
    ]
}
*/

export default Records;
export { Records, allRecordFields };