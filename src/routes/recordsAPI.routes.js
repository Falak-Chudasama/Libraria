import { Router } from 'express';
import { addRecordOne, addRecordMany } from "../controllers/records.controllers.js";
import { findRecords, findRecordByUsername, findRecordByBookTitle, findRecordByUsernameBookTitle } from "../controllers/records.controllers.js";
import { updateRecordBorrow, updateRecordReturn } from "../controllers/records.controllers.js";
import { deleteRecord } from "../controllers/records.controllers.js";


const recordsAPIRouter = Router();

// POST api/records
recordsAPIRouter.post('/one', addRecordOne);
recordsAPIRouter.post('/many', addRecordMany);

// GET api/records
recordsAPIRouter.get('/all', findRecords);
recordsAPIRouter.get('/username/:username', findRecordByUsername);
recordsAPIRouter.get('/bookTitle/:bookTitle', findRecordByBookTitle);
recordsAPIRouter.get('/username/bookTitle/:username/:bookTitle', findRecordByUsernameBookTitle);

// PATCH api/records
recordsAPIRouter.patch('/borrow', updateRecordBorrow);
recordsAPIRouter.patch('/return', updateRecordReturn);

// DELETE api/records
recordsAPIRouter.delete('/username/bookTitle/:username/:bookTitle', deleteRecord);

export default recordsAPIRouter;