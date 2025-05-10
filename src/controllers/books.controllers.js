import Books from "../models/books.models.js";
import Records from "../models/records.models.js";
import winstonLogger from "../utils/logger.utils.js";
import dotenv from 'dotenv';

// TODO: suppose a book is deleted then the records of that book must be deleted too

dotenv.config();
const imageUrlBase = `http://localhost:${process.env.PORT}/uploads/books/`;

// utils
const addBookOneUtil = async (book, imageUrl, bypass) => {
    try {
        winstonLogger.info(`Util: Attempting to add book: ${book.title}`);

        if (!bypass) {
            const existingBooks = await findBooksUtil();
            for (let i = 0; i < existingBooks.length; i++) {
                if (existingBooks.title === book.title) {
                    return await updateAddBookUtil(book.title, true);
                }
            }
            if (!imageUrl) {
                throw new Error('Image file was not provided');
            }
        }

        const bookId = (book.title).trim().toLowerCase().replace(/\s+/g, '_').replace('/^[a-z0-9]/g', '');
        const cost = Number(book.cost);
        const copies = Number(book.totalCopies);

        const newBook = await Books.create({
            bookId: bookId,
            title: book.title,
            author: book.author,
            summary: book.summary,
            description: book.description,
            cost,
            totalCopies: copies,
            availableCopies: copies,
            pages: book?.pages === null ? 100 : book.pages,
            genre: book.genre,
            isbn: book.isbn,
            publishmentYear: book?.publishmentYear,
            edition: book?.edition,
            borrowers: book?.borrowers || [],
            records: book?.records || [],
            coverImage: imageUrl
        });

        if (!newBook) {
            throw new Error('Something went wrong while adding the book');
        }

        winstonLogger.info(`Util: Book ${book.title} added successfully`);
        return newBook;
    } catch (err) {
        winstonLogger.error(`Util: Error while creating new Book '${book.title}' - ${err.message}`);
        throw new Error('Error while creating new Book - ' + err.message);
    }
};

const findBooksUtil = async () => {
    try {
        winstonLogger.info("Util: Attempting to fetch all books");

        const books = await Books.find();
        if (books == null || books.length === 0) {
            throw new Error('No books were found');
        }

        winstonLogger.info("Util: Books successfully fetched");
        return books;
    } catch (err) {
        winstonLogger.error(`Util: Error while fetching books - ${err.message}`);
        throw new Error('Error while fetching books - ' + err.message);
    }
};

const findBookByTitleUtil = async (title) => {
    try {
        winstonLogger.info(`Util: Attempting to fetch book by title: ${title}`);

        const book = await Books.findOne({ title });
        if (!book) {
            throw new Error(`No book found with title '${title}'`);
        }

        winstonLogger.info(`Util: Book with title '${title}' successfully fetched`);
        return book;
    } catch (err) {
        winstonLogger.error(`Util: Error while fetching book with title '${title}' - ${err.message}`);
        throw new Error(`Error while fetching book with title '${title}' - ` + err.message);
    }
};

const updateAddBookUtil = async (title, bypass) => {
    try {
        winstonLogger.info(`Util: Attempting to update copies for book: ${title}`);

        if (!bypass) {
            const book = await findBookByTitleUtil(title);
            if (!book) {
                throw new Error(`Book with title '${title}' not found`);
            }
        }

        const updatedBook = await Books.findOneAndUpdate(
            { title },
            {
                $inc: {
                    availableCopies: 1,
                    totalCopies: 1
                }
            },
            { new: true }
        );

        if (!updatedBook) {
            winstonLogger.error(`Util: Failed to update book ${title}`);
            throw new Error('Something went wrong during the update');
        }

        winstonLogger.info(`Util: Book '${title}' has been successfully updated with new copies`);
        return updatedBook;
    } catch (err) {
        winstonLogger.error(`Util: Error while updating copies for book '${title}' - ${err.message}`);
        throw new Error(`Error while updating copies for book '${title}' - ` + err.message);
    }
};

const updateSubBookUtil = async (title, bypass) => {
    try {
        winstonLogger.info(`Util: Attempting to subtract a copy of the book: ${title}`);

        const book = await Books.findOne({ title });

        if (!bypass) {
            if (!book) {
                throw new Error(`Book with title '${title}' does not exist`);
            }
            if (book.totalCopies <= book.borrowers.length) {
                throw new Error(`Could not remove a copy of the book with title '${title}' because it is borrowed by other users`);
            } else if (book.totalCopies <= 0) {
                throw new Error(`Could not subtract the book with title '${title}' because there are no copies available`);
            }
        }

        const updatedBook = await Books.findOneAndUpdate(
            { title },
            {
                $inc: {
                    availableCopies: -1,
                    totalCopies: -1
                }
            },
            { new: true }
        );

        if (!updatedBook) {
            winstonLogger.error(`Util: Failed to subtract copy of book '${title}'`);
            throw new Error('Something went wrong during the update');
        }

        winstonLogger.info(`Util: Book '${title}' has been successfully subtracted`);
        return updatedBook;
    } catch (err) {
        winstonLogger.error(`Util: Error while subtracting copies for book '${title}' - ${err.message}`);
        throw new Error(`Error while subtracting copies for book '${title}' - ` + err.message);
    }
};

const updateBookReturnUtil = async (title, username, bypass) => {
    try {
        winstonLogger.info(`Util: Attempting to update return record for book: '${title}' by user: '${username}'`);

        if (!bypass) {
            const book = await findBookByTitleUtil(title);

            if (!book) {
                throw new Error(`Book with title '${title}' does not exist`);
            }
        }

        const updatedBook = await Books.findOneAndUpdate(
            { title },
            {
                $inc: {
                    availableCopies: 1
                },
                $pull: {
                    borrowers: username
                }
            },
            { new: true }
        );

        if (!updatedBook) {
            throw new Error('Something went wrong during the update');
        }

        winstonLogger.info(`Util: Book '${title}' has been successfully returned by user '${username}'`);
        return updatedBook;
    } catch (err) {
        winstonLogger.error(`Util: Error while updating return record for book '${title}' - ${err.message}`);
        throw new Error(`Error while updating return record for book '${title}' - ` + err.message);
    }
};

const updateBookBorrowUtil = async (title, username, recordId, bypass) => {
    try {
        winstonLogger.info(`Util: Attempting to update borrow record for book: '${title}' by user: '${username}'`);

        if (!bypass) {
            const book = await Books.find({ title });

            if (!book) {
                throw new Error(`Book with title '${title}' does not exist`);
            }

            if (book.availableCopies <= 0) {
                throw new Error(`Book with title '${title}' has no copies available`);
            }
        }

        const updatedBook = await Books.findOneAndUpdate(
            { title },
            {
                $inc: {
                    availableCopies: -1
                },
                $addToSet: {
                    borrowers: username,
                    records: recordId
                }
            },
            { new: true }
        );

        if (!updatedBook) {
            throw new Error('Something went wrong during the update');
        }

        winstonLogger.info(`Util: Book '${title}' has been successfully borrowed by user '${username}'`);
        return updatedBook;
    } catch (err) {
        winstonLogger.error(`Util: Error while updating borrow record for book '${title}' - ${err.message}`);
        throw new Error(`Error while updating borrow record for book '${title}' - ` + err.message);
    }
};

const deleteBookUtil = async (title, bypass) => {
    try {
        winstonLogger.info(`Util: Attempting to delete book with title: '${title}'`);

        if (!bypass) {
            const book = await findBookByTitleUtil(title);

            if (!book) {
                throw new Error(`Book with title '${title}' does not exist`);
            }
            
            if (book.availableCopies != book.totalCopies) {
                throw new Error(`Could not delete the book with title '${title}' because it is borrowed by users`);
            }
        }

        const deletedRecords = await Records.deleteMany({ bookTitle: title });
        const deletedBook = await Books.deleteOne({ title });

        if (!deletedBook) {
            throw new Error('Something went wrong during the deletion process');
        }

        winstonLogger.info(`Util: Book '${title}' deleted successfully`);
        return deletedBook;
    } catch (err) {
        winstonLogger.error(`Util: Error while deleting book '${title}' - ${err.message}`);
        throw new Error(`Error while deleting book '${title}' - ` + err.message);
    }
};

// POST operation;
const addBookOne = async (req, res) => {
    try {
        const { title } = req.body;
        winstonLogger.info(`Attempting to add book: ${title}`);

        const existingBooks = await Books.find();

        for (let i = 0; i < existingBooks.length; i++) {
            if (existingBooks[i].title === title) {
                const updatedBook = await updateAddBookUtil(title, true);
                winstonLogger.info(`Book '${title}' added successfully`);
                return res.status(200).json({ updatedBook, message: `Book with title '${title}' has been updated by one` });
            }
        }

        if (!req.file) {
            winstonLogger.error(`No image file was provided`);
            return res.status(400).json({ message: `No image file was provided` });
        }

        const coverImageFile = req.file.filename;

        if (!coverImageFile) {
            winstonLogger.error(`Cover image of Book with title '${title}' was not included`);
            return res.status(400).json({ message: `Cover image of Book with title '${title}' was not included` })
        }

        const imageUrl = `${imageUrlBase}${coverImageFile}`;

        const newBook = await addBookOneUtil(req.body, imageUrl, true);

        winstonLogger.info(`Book '${title}' added successfully`);
        return res.status(201).json({ newBook, message: `Book with title '${title}' has been created` });
    } catch (err) {
        winstonLogger.error(`Error while adding book: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
};

// const addBookMany = async (req, res) => {
//     const books = req.body;
//     const newBooks = [];
//     const errors = [];
//     let existingBooks = await findBooksUtil();

//     for (let i = 0; i < books.length; i++) {
//         try {
//             const book = books[i];
//             winstonLogger.info(`Attempting to add book: ${book.title}`);

//             let flag = false;
//             let newBook;

//             for(let j = 0; j < existingBooks.length; j++) {
//                 if (existingBooks[j].title === book.title) {
//                     flag = true;
//                     newBook = await updateAddBookUtil(book.title);
//                     break;
//                 } 
//             }

//             if (!flag) {
//                 newBook = await addBookOneUtil(book, true);
//             }

//             newBooks.push(newBook);
//             existingBooks.push(newBook);
//             winstonLogger.info(`Book '${book.title}' added successfully`);
//         } catch (err) {
//             errors.push({
//                 book: books[i],
//                 error: err.message
//             });
//             winstonLogger.error(`Error while adding book '${books[i].title}': ${err.message}`);
//         }
//     }

//     if (newBooks.length === 0) {
//         winstonLogger.info('No books were added');
//         return res.status(400).json({
//             message: 'No books were added',
//             errors
//         });
//     } else if (errors.length > 0) {
//         winstonLogger.info('Some books were added, but some encountered errors');
//         return res.status(207).json({
//             message: 'Some books were added',
//             errors,
//             newBooks
//         });
//     } else {
//         winstonLogger.info('All books were added successfully');
//         return res.status(201).json({
//             message: 'All books were added',
//             newBooks
//         });
//     }
// };

// GET operations

const findBooks = async (req, res) => {
    try {
        winstonLogger.info("Attempting to fetch all books");
        const books = await findBooksUtil();

        if (books == null || books.length === 0) {
            winstonLogger.error("No books were found in the database");
            return res.status(404).json({ message: 'No Books were found' });
        }

        winstonLogger.info(`${books.length} books fetched successfully`);
        return res.status(200).json(books);
    } catch (err) {
        winstonLogger.error(`Error while fetching books: ${err.message}`);
        return res.status(400).json({ error: err.message });
    }
};

const findBookByTitle = async (req, res) => {
    try {
        winstonLogger.info(`Attempting to fetch book with title: '${req.params.title}'`);
        const book = await findBookByTitleUtil(req.params.title);

        if (book === null) {
            winstonLogger.error(`Book with title '${req.params.title}' not found`);
            return res.status(404).json({ error: `Book with title '${req.params.title}' not found` });
        }

        winstonLogger.info(`Successfully fetched book with title: '${req.params.title}'`);
        return res.status(200).json(book);
    } catch (err) {
        winstonLogger.error(`Error while fetching book with title '${req.params.title}': ${err.message}`);
        return res.status(400).json({ error: err.message });
    }
};


// PATCH operations
const updateAddBook = async (req, res) => {
    const title = req.params.title;
    try {
        winstonLogger.info(`Attempting to add a copy of the book with title: '${title}'`);

        const book = await findBookByTitleUtil(title);
        if (book === null) {
            winstonLogger.error(`Book with title '${title}' not found`);
            return res.status(404).json({ error: `Book with title '${title}' not found` });
        }

        const updatedBook = await updateAddBookUtil(title, true);
        if (updatedBook === null) {
            winstonLogger.error(`Error while adding a copy of the book with title '${title}'`);
            return res.status(500).json({ message: `Error while adding a copy of the book with title '${title}'` });
        }

        winstonLogger.info(`Successfully added a copy of the book with title: '${title}'`);
        return res.status(200).json(updatedBook);
    } catch (err) {
        winstonLogger.error(`Error while adding a copy of the book with title '${title}': ${err.message}`);
        return res.status(400).json({ error: err.message });
    }
};

const updateSubBook = async (req, res) => {
    const title = req.params.title;
    try {
        winstonLogger.info(`Attempting to subtract a copy of the book with title: '${title}'`);

        const book = await findBookByTitleUtil(title);
        if (book === null) {
            winstonLogger.error(`Book with title '${title}' not found`);
            return res.status(404).json({ message: `Book with title '${title}' not found` });
        } else if (book.totalCopies === 0) {
            winstonLogger.error(`No copies available to subtract for book with title '${title}'`);
            return res.status(400).json({ message: `Could not subtract the book with title '${title}' because there are no copies available` });
        } else if (book.totalCopies <= book.borrowers.length) {
            winstonLogger.error(`Util: Could not subtract copy of book '${title}' because it is currently borrowed by all users`);
            return res.status(400).json({ message: `Could not remove a copy of the book with title '${title}' because it is borrowed by other users` });
        }

        const updatedBook = await updateSubBookUtil(title, true);
        if (updatedBook === null) {
            winstonLogger.error(`Error while subtracting a copy of the book with title '${title}'`);
            return res.status(500).json({ message: `Error while subtracting a copy of the book with title '${title}'` });
        }

        winstonLogger.info(`Successfully subtracted a copy of the book with title: '${title}'`);
        return res.status(200).json(updatedBook);
    } catch (err) {
        winstonLogger.error(`Error while subtracting a copy of the book with title '${title}': ${err.message}`);
        return res.status(400).json({ error: err.message });
    }
};

const updateBookReturn = async (req, res) => {
    const title = req.body.title;
    const username = req.body.username;
    try {
        winstonLogger.info(`Attempting to return the book with title: '${title}' by user: '${username}'`);

        const updatedBook = await updateBookReturnUtil(title, username, true);
        if (updatedBook === null) {
            winstonLogger.error(`Book with title '${title}' not found for return`);
            return res.status(404).json({ message: `Book with title '${title}' not found` });
        }

        winstonLogger.info(`Successfully returned the book with title: '${title}' by user: '${username}'`);
        return res.status(200).json(updatedBook);
    } catch (err) {
        winstonLogger.error(`Error while returning the book with title '${title}' by user '${username}': ${err.message}`);
        return res.status(400).json({ error: err.message });
    }
};

const updateBookBorrow = async (req, res) => {
    const title = req.body.title;
    const username = req.body.username;
    const recordId = req.body.recordId;
    try {
        winstonLogger.info(`Attempting to borrow the book with title: '${title}' by user: '${username}'`);

        const book = await findBookByTitleUtil(title);
        if (book.availableCopies === 0) {
            winstonLogger.error(`Could not borrow the book with title '${title}' because there are no copies left`);
            return res.status(409).json({ message: `Could not borrow the book with title '${title}' because there are no copies left` });
        }

        const updatedBook = await updateBookBorrowUtil(title, username, recordId, true);
        if (updatedBook === null) {
            winstonLogger.error(`Book with title '${title}' not found during borrow attempt`);
            return res.status(404).json({ message: `Book with title '${title}' was not found` });
        }

        winstonLogger.info(`Successfully borrowed the book with title: '${title}' by user: '${username}'`);
        return res.status(200).json(updatedBook);
    } catch (err) {
        winstonLogger.error(`Error while borrowing the book with title '${title}' by user '${username}': ${err.message}`);
        return res.status(400).json({ error: err.message });
    }
};

// DELETE operation
const deleteBook = async (req, res) => {
    const title = req.params.title;
    try {
        winstonLogger.info(`Attempting to delete book with title: '${title}'`);

        const book = await findBookByTitleUtil(title);

        if (!book) {
            winstonLogger.error(`Book with title '${title}' does not exist`);
            return res.status(404).json({ message: `Book with title '${title}' does not exist` });
        }

        if (book.availableCopies != book.totalCopies) {
            winstonLogger.error(`Could not delete the book with title '${title}' because it is borrowed by users`);
            return res.status(409).json({ message: `Could not delete the book with title '${title}' because it is borrowed by Users` });
        }

        const deletedBook = await deleteBookUtil(title, true);
        winstonLogger.info(`Successfully deleted book with title: '${title}'`);
        return res.status(200).json(deletedBook);
    } catch (err) {
        winstonLogger.error(`Error while deleting the book with title '${title}': ${err.message}`);
        return res.status(400).json({ error: err.message });
    }
};


export default addBookOne;
export {
    addBookOneUtil,
    addBookOne,
    // addBookMany,
    findBooksUtil,
    findBooks,
    findBookByTitleUtil,
    findBookByTitle,
    updateAddBookUtil,
    updateAddBook,
    updateSubBookUtil,
    updateSubBook,
    updateBookReturnUtil,
    updateBookReturn,
    updateBookBorrowUtil,
    updateBookBorrow,
    deleteBookUtil,
    deleteBook
};