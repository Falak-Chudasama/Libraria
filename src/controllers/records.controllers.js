import Records from "../models/records.models.js";
import dotenv from 'dotenv';
import { findUserByUsernameUtil } from './users.controller.js';
import { findBookByTitleUtil } from './books.controllers.js';
import { updateBookBorrowUtil, updateBookReturnUtil } from './books.controllers.js';
import { updateUserBorrowsBookUtil, updateUserReturnsBookUtil } from './users.controller.js';
import { addToDate, compareDates } from '../utils/dates.utils.js';
import winstonLogger from "../utils/logger.utils.js";

dotenv.config();

const addRecordUtil = async (record, bypass) => {
    try {
        winstonLogger.info(`Util: Attempting to add a new record for user: ${record.username} and book: ${record.bookTitle}`);

        if (!bypass) {
            const user = await findUserByUsernameUtil(record.username);
            const book = await findBookByTitleUtil(record.bookTitle);

            if (!user) {
                throw new Error(`User with username '${user.username}' not found`);
            }
            if (!book) {
                throw new Error(`Book with title '${book.title}' not found`);
            }

            const userRecords = await findRecordByUsernameUtil(record.username);
            if (userRecords && userRecords.length > 0) {
                for (let i = 0; i < userRecords.length; i++) {
                    if (userRecords[i].bookWithUser) {
                        throw new Error(`User with username '${userRecords[i].username}' still has a book with title '${userRecords[i].bookTitle}'`);
                    }
                }
            }

            const recordExists = await findRecordByUsernameBookTitleUtil(record.username, record.bookTitle);
            if (recordExists != null) {
                return await updateRecordBorrowUtil(record);
            }
        }

        const deliveryDate = record?.deliveryDate || addToDate(new Date(record.borrowDate), Number(process.env.DELIVERY_DATE_DELAY));
        if (compareDates(deliveryDate, record.dueDate) === 1) {
            throw new Error('Due date must be after Delivery date');
        }

        const book = await findBookByTitleUtil(record.bookTitle);
        if (book.availableCopies <= 0) {
            throw new Error(`Book with title '${record.bookTitle}' has no copies available`);
        }

        const newRecord = await Records.create({
            username: record.username,
            bookTitle: record.bookTitle,
            bookWithUser: true,
            timesBorrowed: 1,
            borrowDates: [record.borrowDate],
            deliveryDates: [deliveryDate],
            dueDates: [record.dueDate]
        });

        const recordId = newRecord._id;
        const borrowingUser = await updateUserBorrowsBookUtil(record.username, record.bookTitle, recordId, true);
        if (!borrowingUser) {
            throw new Error(`Something went wrong while user(${record.username}) borrowing the book`);
        }

        const borrowedBook = await updateBookBorrowUtil(record.bookTitle, record.username, recordId, true);
        if (!borrowedBook) {
            throw new Error(`Something went wrong while book(${record.bookTitle}) being borrowed`);
        }

        winstonLogger.info(`Util: Successfully added a new record for user: ${record.username} and book: ${record.bookTitle}`);
        return newRecord;
    } catch (err) {
        winstonLogger.error(`Util: ${err.message}`);
        throw new Error('Error while creating new Record - ' + err.message);
    }
};

const findRecordsUtil = async () => {
    try {
        winstonLogger.info(`Util: Attempting to find all records`);

        const records = await Records.find();

        winstonLogger.info(`Util: Successfully retrieved all records`);
        return records || null;
    } catch (err) {
        winstonLogger.error(`Util: Error while getting records - ${err.message}`);
        throw new Error('Error while getting records - ' + err.message);
    }
};

const findRecordByUsernameBookTitleUtil = async (username, bookTitle) => {
    try {
        winstonLogger.info(`Util: Attempting to find record for user: ${username} with book title: ${bookTitle}`);

        const record = await Records.findOne({ username, bookTitle });

        winstonLogger.info(`Util: Successfully retrieved record for user: ${username} with book title: ${bookTitle}`);
        return record || null;
    } catch (err) {
        winstonLogger.error(`Util: Error while getting record via username and bookTitle - ${err.message}`);
        throw new Error('Error while getting record via username and bookTitle - ' + err.message);
    }
};

const findRecordByUsernameUtil = async (username) => {
    try {
        winstonLogger.info(`Util: Attempting to find records for user: ${username}`);

        const record = await Records.find({ username });

        winstonLogger.info(`Util: Successfully retrieved records for user: ${username}`);
        return record || null;
    } catch (err) {
        winstonLogger.error(`Util: Error while getting records via username - ${err.message}`);
        throw new Error('Error while getting records via username - ' + err.message);
    }
};

const findRecordByBookTitleUtil = async (bookTitle) => {
    try {
        winstonLogger.info(`Util: Attempting to find records for book title: ${bookTitle}`);

        const record = await Records.find({ bookTitle });

        winstonLogger.info(`Util: Successfully retrieved records for book title: ${bookTitle}`);
        return record || null;
    } catch (err) {
        winstonLogger.error(`Util: Error while getting records via bookTitle - ${err.message}`);
        throw new Error('Error while getting records via bookTitle - ' + err.message);
    }
};

const updateRecordBorrowUtil = async (record) => {
    try {
        const username = record.username;
        const bookTitle = record.bookTitle;

        winstonLogger.info(`Util: Attempting to update borrow record for user: ${username} with book title: ${bookTitle}`);

        const existingRecord = await Records.findOne({ username, bookTitle });
        if (existingRecord.bookWithUser) {
            throw new Error(`User with username '${username}' already has a book with title '${bookTitle}'`);
        }

        const deliveryDate = record?.deliveryDate || addToDate(new Date(record.borrowDate), Number(process.env.DELIVERY_DATE_DELAY));
        if (compareDates(deliveryDate, record.dueDate) === 1) {
            throw new Error('Due date must be after Delivery date');
        }

        const book = await findBookByTitleUtil(record.bookTitle);
        if (book.availableCopies <= 0) {
            throw new Error(`Book with title '${record.bookTitle}' has no copies available`);
        }

        const updatedRecord = await Records.findOneAndUpdate(
            { username, bookTitle },
            {
                $inc: {
                    timesBorrowed: 1
                },
                $set: {
                    bookWithUser: true
                },
                $push: {
                    borrowDates: new Date(record.borrowDate),
                    deliveryDates: deliveryDate,
                    dueDates: new Date(record.dueDate)
                }
            },
            { new: true }
        );

        if (!updatedRecord) {
            throw new Error('Record was not found');
        }

        const recordId = updatedRecord._id;
        const borrowingUser = await updateUserBorrowsBookUtil(username, bookTitle, recordId);
        if (!borrowingUser) {
            throw new Error(`Something went wrong while user(${username}) borrowing the book`);
        }

        const borrowedBook = await updateBookBorrowUtil(bookTitle, username, recordId);
        if (!borrowedBook) {
            throw new Error(`Something went wrong while book(${bookTitle}) being borrowed`);
        }

        winstonLogger.info(`Util: Successfully updated borrow record for user: ${username} with book title: ${bookTitle}`);
        return updatedRecord;
    } catch (err) {
        winstonLogger.error(`Util: Error while updating(borrowing) the record - ${err.message}`);
        throw new Error('Error while updating(borrowing) the record - ' + err.message);
    }
};


const updateRecordReturnUtil = async (record) => {
    try {
        const username = record.username;
        const bookTitle = record.bookTitle;

        winstonLogger.info(`Util: Attempting to update return record for user: ${username} with book title: ${bookTitle}`);

        const existingRecord = await Records.findOne({ username, bookTitle });
        if (!existingRecord.bookWithUser) {
            throw new Error(`User with username '${username}' has no book with them`);
        }

        const updatedRecord = await Records.findOneAndUpdate(
            { username, bookTitle },
            {
                $set: {
                    bookWithUser: false
                }
            },
            { new: true }
        );

        if (!updatedRecord) {
            throw new Error('Record was not found');
        }

        const returningUser = await updateUserReturnsBookUtil(username, true);
        if (!returningUser) {
            throw new Error(`Something went wrong while user(${username}) returning the book`);
        }

        const returnedBook = await updateBookReturnUtil(bookTitle, username, true);
        if (!returnedBook) {
            throw new Error(`Something went wrong while book(${bookTitle}) being returned`);
        }

        winstonLogger.info(`Util: Successfully updated return record for user: ${username} with book title: ${bookTitle}`);
        return updatedRecord;
    } catch (err) {
        winstonLogger.error(`Util: Error while updating(returning) the record - ${err.message}`);
        throw new Error('Error while updating(returning) the record - ' + err.message);
    }
};

const deleteRecordUtil = async (username, bookTitle, bypass) => {
    try {
        winstonLogger.info(`Util: Attempting to delete record for user: ${username} with book title: ${bookTitle}`);

        if (!bypass) {
            const record = await Records.findOne({ username, bookTitle });
            if (!record) {
                throw new Error(`Record of user with username '${username}' and book with title '${bookTitle}' does not exist in the first place`);
            }
            if (record.bookWithUser) {
                throw new Error(`Could not Delete the record because user with username '${username}' still has book with title '${bookTitle}'`);
            }
        }

        const deletedRecord = await Records.findOneAndDelete({ username, bookTitle });

        if (!deletedRecord) {
            throw new Error('Record not found');
        }

        winstonLogger.info(`Util: Successfully deleted record for user: ${username} with book title: ${bookTitle}`);
        return deletedRecord;
    } catch (err) {
        winstonLogger.error(`Util: Error while deleting record - ${err.message}`);
        throw new Error('Error while deleting record - ' + err.message);
    }
};

// POST operations
const addRecordOne = async (req, res) => {
    try {
        winstonLogger.info('Attempting to add a new record');

        const record = req.body;
        const user = await findUserByUsernameUtil(record.username);
        const book = await findBookByTitleUtil(record.bookTitle);

        if (!user) {
            winstonLogger.error(`User with username '${user.username}' not found`);
            return res.status(404).json({ message: `User with username '${user.username}' not found` });
        }
        if (!book) {
            winstonLogger.error(`Book with title '${book.title}' not found`);
            return res.status(404).json({ message: `Book with title '${book.title}' not found` });
        }

        const userRecords = await findRecordByUsernameUtil(record.username);
        if (userRecords && userRecords.length > 0) {
            for (let i = 0; i < userRecords.length; i++) {
                if (userRecords[i].bookWithUser) {
                    winstonLogger.info(`User with username '${userRecords[i].username}' already has a book with title '${userRecords[i].bookTitle}'`);
                    return res.status(409).json({ message: `User with username '${userRecords[i].username}' already has a book with title '${userRecords[i].bookTitle}'` });
                }
            }
        }

        const recordExists = await findRecordByUsernameBookTitleUtil(record.username, record.bookTitle);
        if (recordExists != null) {
            return await updateRecordBorrow(req, res);
        }

        const newRecord = await addRecordUtil(record, true);

        winstonLogger.info('Record successfully added');

        return res.status(201).json(newRecord);
    } catch (err) {
        winstonLogger.error('Error while adding record - ' + err.message);
        return res.status(400).json({ error: err.message });
    }
};

const addRecordMany = async (req, res) => {
    winstonLogger.info('Attempting to add multiple records');

    const records = req.body;
    const newRecords = [];
    const errors = [];
    const updatedRecords = [];

    for (let i = 0; i < records.length; i++) {
        try {
            const user = await findUserByUsernameUtil(records[i].username);
            const book = await findBookByTitleUtil(records[i].bookTitle);

            if (!user) {
                throw new Error(`User with username '${user.username}' not found`);
            }
            if (!book) {
                throw new Error(`Book with title '${book.title}' not found`);
            }

            let flag = false;
            const userRecords = await findRecordByUsernameUtil(records[i].username);
            if (userRecords && userRecords.length > 0) {
                for (let j = 0; j < userRecords.length; j++) {
                    if (userRecords[j].bookWithUser) {
                        flag = true;
                        errors.push({
                            record: records[i],
                            prevRecord: userRecords[j],
                            message: `User with username '${userRecords[j].username}' still has a book with title '${userRecords[j].bookTitle}'`
                        });
                    }
                }
            }
            if (flag) {
                continue;
            }
            const recordExists = await findRecordByUsernameBookTitleUtil(records[i].username, records[i].bookTitle);
            if (recordExists != null) {
                updatedRecords.push(await updateRecordBorrowUtil(records[i]));
                continue;
            }
            const newRecord = await addRecordUtil(records[i], true);
            newRecords.push(newRecord);
        } catch (err) {
            errors.push({
                record: records[i],
                error: err.message
            });
        }
    }

    if (newRecords.length === 0 && updatedRecords.length === 0) {
        winstonLogger.info('No records were processed');
        return res.status(400).json({
            message: 'No records were processed',
            errors
        });
    }

    if (updatedRecords.length === 0 && errors.length === 0) {
        winstonLogger.info('All new records successfully added');
        return res.status(201).json({
            message: 'All new records successfully added',
            newRecords
        });
    }

    if (newRecords.length === 0 && errors.length === 0) {
        winstonLogger.info('All existing records successfully updated');
        return res.status(200).json({
            message: 'All existing records successfully updated',
            updatedRecords
        });
    }

    if (errors.length > 0 && newRecords.length > 0 && updatedRecords.length > 0) {
        winstonLogger.info('Partial processing: Some records added, some updated, some failed');
        return res.status(207).json({
            message: 'Partial processing: Some records added, some updated, some failed',
            success: {
                newRecords: newRecords.length,
                updatedRecords: updatedRecords.length
            },
            errors,
            newRecords,
            updatedRecords
        });
    }

    if (errors.length > 0 && newRecords.length > 0) {
        winstonLogger.info('Partial processing: Some new records added, some records failed');
        return res.status(207).json({
            message: 'Partial processing: Some new records added, some records failed',
            success: {
                newRecords: newRecords.length
            },
            errors,
            newRecords
        });
    }

    if (errors.length > 0 && updatedRecords.length > 0) {
        winstonLogger.info('Partial processing: Some existing records updated, some records failed');
        return res.status(207).json({
            message: 'Partial processing: Some existing records updated, some records failed',
            success: {
                updatedRecords: updatedRecords.length
            },
            errors,
            updatedRecords
        });
    }

    if (newRecords.length > 0 && updatedRecords.length > 0) {
        winstonLogger.info('Successfully processed: Some new records added, some existing records updated');
        return res.status(200).json({
            message: 'Successfully processed: Some new records added, some existing records updated',
            newRecords,
            updatedRecords
        });
    }

    winstonLogger.error('Unexpected processing result');
    return res.status(500).json({
        message: 'Unexpected processing result',
        details: {
            newRecords: newRecords.length,
            updatedRecords: updatedRecords.length,
            errors: errors.length
        }
    });
};

// GET operations
const findRecords = async (req, res) => {
    winstonLogger.info('Attempting to find records');

    try {
        const records = await findRecordsUtil();
        if (records == null || records.length === 0) {
            winstonLogger.info('No records were found');
            return res.status(404).json({ message: 'No Records were found' });
        }

        winstonLogger.info('Records found successfully');
        return res.status(200).json(records);
    } catch (err) {
        winstonLogger.error('Error occurred while finding records: ' + err.message);
        return res.status(400).json({ error: err.message });
    }
};

const findRecordByUsername = async (req, res) => {
    winstonLogger.info('Attempting to find records by username: ' + req.params.username);

    try {
        const record = await findRecordByUsernameUtil(req.params.username);
        if (record == null || record.length == 0) {
            winstonLogger.info(`No records found for user with username: '${req.params.username}'`);
            return res.status(404).json({ error: `Records of User's username '${req.params.username}' not found` });
        }

        winstonLogger.info(`Records found for user with username: '${req.params.username}'`);
        return res.status(200).json(record);
    } catch (err) {
        winstonLogger.error('Error occurred while finding records for username: ' + req.params.username + ' - ' + err.message);
        return res.status(400).json({ error: err.message });
    }
};

const findRecordByBookTitle = async (req, res) => {
    winstonLogger.info('Attempting to find records by book title: ' + req.params.bookTitle);

    try {
        const record = await findRecordByBookTitleUtil(req.params.bookTitle);
        if (record == null || record.length == 0) {
            winstonLogger.info(`No records found for book with title: '${req.params.bookTitle}'`);
            return res.status(404).json({ error: `Records of Books's title '${req.params.bookTitle}' not found` });
        }

        winstonLogger.info(`Records found for book with title: '${req.params.bookTitle}'`);
        return res.status(200).json(record);
    } catch (err) {
        winstonLogger.error('Error occurred while finding records for book title: ' + req.params.bookTitle + ' - ' + err.message);
        return res.status(400).json({ error: err.message });
    }
};

const findRecordByUsernameBookTitle = async (req, res) => {
    winstonLogger.info('Attempting to find record by username: ' + req.params.username + ' and book title: ' + req.params.bookTitle);

    try {
        const record = await findRecordByUsernameBookTitleUtil(req.params.username, req.params.bookTitle);
        if (record == null) {
            winstonLogger.info(`No record found for user '${req.params.username}' with book title '${req.params.bookTitle}'`);
            return res.status(404).json({ error: `Record of User's username '${req.params.username}' and Book's title '${req.params.bookTitle}' not found` });
        }

        winstonLogger.info(`Record found for user '${req.params.username}' with book title '${req.params.bookTitle}'`);
        return res.status(200).json(record);
    } catch (err) {
        winstonLogger.error('Error occurred while finding record for user: ' + req.params.username + ' and book title: ' + req.params.bookTitle + ' - ' + err.message);
        return res.status(400).json({ error: err.message });
    }
};

// PATCH operation
const updateRecordBorrow = async (req, res) => {
    winstonLogger.info('Attempting to update borrow record for user: ' + req.body.username + ' and book title: ' + req.body.bookTitle);

    const record = req.body;
    const username = record.username;
    const bookTitle = record.bookTitle;

    try {
        console.log('entered updateRecordBorrow');
        const existingRecord = await findRecordByUsernameBookTitleUtil(username, bookTitle);
        if (existingRecord === null) {
            winstonLogger.info(`No record found for user '${username}' with book title '${bookTitle}'`);
            return res.status(404).json({ message: `Record of User's username '${username}' and Book's title '${bookTitle}' not found` });
        }
        if (existingRecord.bookWithUser) {
            winstonLogger.info(`User '${username}' still has the book '${bookTitle}'`);
            return res.status(409).json({ message: `Record could not be updated because User with username '${username}' still has a Book with title '${bookTitle}'` });
        }

        const updatedRecord = await updateRecordBorrowUtil(record);
        winstonLogger.info(`Record updated successfully for user '${username}' with book title '${bookTitle}'`);
        return res.status(200).json(updatedRecord);
    } catch (err) {
        winstonLogger.error('Error occurred while updating record for user: ' + username + ' and book title: ' + bookTitle + ' - ' + err.message);
        return res.status(400).json({ error: err.message });
    }
};

const updateRecordReturn = async (req, res) => {
    winstonLogger.info('Attempting to update return record for user: ' + req.body.username + ' and book title: ' + req.body.bookTitle);

    const record = req.body;
    const username = record.username;
    const bookTitle = record.bookTitle;

    try {
        const existingRecord = await findRecordByUsernameBookTitleUtil(username, bookTitle);
        if (existingRecord === null) {
            winstonLogger.info(`No record found for user '${username}' with book title '${bookTitle}'`);
            return res.status(404).json({ message: `Record of User's username '${username}' and Book's title '${bookTitle}' not found` });
        }
        if (!existingRecord.bookWithUser) {
            winstonLogger.info(`User '${username}' does not have the book '${bookTitle}'`);
            return res.status(409).json({ message: `Record could not be updated because User with username '${username}' has no book` });
        }

        const updatedRecord = await updateRecordReturnUtil(record);
        winstonLogger.info(`Record updated successfully for user '${username}' with book title '${bookTitle}'`);
        return res.status(200).json(updatedRecord);
    } catch (err) {
        winstonLogger.error('Error occurred while updating return record for user: ' + username + ' and book title: ' + bookTitle + ' - ' + err.message);
        return res.status(400).json({ error: err.message });
    }
};

// DELETE operation
const deleteRecord = async (req, res) => {
    winstonLogger.info('Attempting to delete record for user: ' + req.params.username + ' and book title: ' + req.params.bookTitle);

    const username = req.params.username;
    const bookTitle = req.params.bookTitle;

    try {
        const record = await Records.findOne({ username, bookTitle });

        if (!record) {
            winstonLogger.info(`Record of user with username '${username}' and book with title '${bookTitle}' does not exist in the first place`);
            return res.status(200).json({ message: `Record of user with username '${username}' and book with title '${bookTitle}' does not exist in the first place` })
        }
        if (record.bookWithUser) {
            winstonLogger.error(`Could not Delete the record because user with username '${username}' still has book with title '${bookTitle}'`);
            return res.status(409).json({ message: `Could not Delete the record because user with username '${username}' still has book with title '${bookTitle}'` })
        }

        const deletedRecord = await deleteRecordUtil(username, bookTitle, true);
        if (!deleteRecord) {
            winstonLogger.error(`Something went wrong while deleting a record of user with username '${username}' still has book with title '${bookTitle}'`);
            return res.status(500).json({ message: `Something went wrong while deleting a record of user with username '${username}' still has book with title '${bookTitle}'` });
        }

        winstonLogger.info(`Record deleted successfully for user '${username}' with book title '${bookTitle}'`);
        return res.status(200).json(deletedRecord);
    } catch (err) {
        winstonLogger.error('Error occurred while deleting record for user: ' + username + ' and book title: ' + bookTitle + ' - ' + err.message);
        return res.status(400).json({ error: err.message });
    }
};

export default addRecordOne;
export {
    addRecordUtil,
    addRecordOne,
    addRecordMany,
    findRecordsUtil,
    findRecords,
    findRecordByUsernameUtil,
    findRecordByUsername,
    findRecordByBookTitleUtil,
    findRecordByBookTitle,
    findRecordByUsernameBookTitleUtil,
    findRecordByUsernameBookTitle,
    updateRecordBorrowUtil,
    updateRecordBorrow,
    updateRecordReturnUtil,
    updateRecordReturn,
    deleteRecordUtil,
    deleteRecord
};