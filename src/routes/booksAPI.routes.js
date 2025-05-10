import { Router } from "express";
import { addBookOne } from "../controllers/books.controllers.js";
import { findTopBooks, findBooks, findBookByTitle } from "../controllers/books.controllers.js";
import { updateAddBook, updateSubBook, updateBookReturn, updateBookBorrow } from "../controllers/books.controllers.js";
import { deleteBook } from "../controllers/books.controllers.js";
import upload from "../middlewares/multer.middlewares.js";

const booksAPIRouter = Router();

// POST /api/books
booksAPIRouter.post('/one', upload.single('coverImage'), addBookOne);

// GET /api/books
booksAPIRouter.get('/all', findBooks);
booksAPIRouter.get('/allTop', findTopBooks);
booksAPIRouter.get('/title/:title', findBookByTitle);

// PATCH /api/books
booksAPIRouter.patch('/addCopy/title/:title', updateAddBook);
booksAPIRouter.patch('/subCopy/title/:title', updateSubBook);
booksAPIRouter.patch('/borrowCopy', updateBookBorrow);
booksAPIRouter.patch('/returnCopy', updateBookReturn);

// DELETE /api/books
booksAPIRouter.delete('/title/:title', deleteBook);

export default booksAPIRouter;