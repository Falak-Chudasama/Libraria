import mongoose, { mongo } from 'mongoose';

const maxCost = 1000;

const minUsernameLength = 8;
const maxUsernameLength = 20;

const minLength = 3;
const maxLength = 100;

const miniDescriptionMinLength = 10;
const miniDescriptionMaxLength = 100;

const descriptionMinLength = 50;
const descriptionMaxLength = 400;

const BookSchema = new mongoose.Schema({
    bookId: {
        type: String,
        required: [true, 'BookId is required'],
        unique: [true, 'BookId must be unique'],
        trim: true,
        minLength: [minLength, 'BookId must be at least ' + minLength + ' characters long'],
        maxLength: [maxLength, 'BookId should not exceed ' + maxLength + ' characters']
    },
    title: { // pseudo primary key
        type: String,
        required: [true, 'Book Title is required'],
        unique: [true, 'Book Title must be unique'],
        trim: true,
        minLength: [minLength, 'Title must be at least ' + minLength + ' characters long'],
        maxLength: [maxLength, 'Title should not exceed ' + maxLength + ' characters']
    },
    author: {
        type: String,
        required: [true, "Author's name is required"],
        trim: true,
        minLength: [minLength, "Author's name must be at least " + minLength + " characters long"],
        maxLength: [maxLength, "Author's name should not exceed " + maxLength + " characters"]
    },
    miniDescription: { // f2 into summary
        type: String,
        required: [true, 'Book Mini Description is required'],
        trim: true,
        minLength: [miniDescriptionMinLength, "Book's Mini Description must be at least " + miniDescriptionMinLength + " characters long"],
        maxLength: [miniDescriptionMaxLength, "Books's Mini Description should not exceed " + miniDescriptionMaxLength + " characters"]
    },
    description: {
        type: String,
        required: [true, 'Book Description is required'],
        trim: true,
        minLength: [descriptionMinLength, "Book's Description must be at least " + descriptionMinLength + " characters long"],
        maxLength: [descriptionMaxLength, "Books's Description should not exceed " + descriptionMaxLength + " characters"]
    },
    cost: {
        type: Number,
        required: [true, 'Book Cost is required'],
        min: [0, 'Cost must be a postive value'],
        max: [maxCost, 'Book cannot cost $' + maxCost + ' much']
    },
    totalCopies: {
        type: Number,
        default: 1
    },
    availableCopies: {
        type: Number,
        default: 1
    },
    pages: {
        type: Number,
        default: 100,
    },
    genre: {
        type: String,
        required: [true, 'Book Genre is required'],
        trim: true,
        minLength: [minLength, 'Genre must be at least ' + minLength + ' characters long'],
        maxLength: [maxLength, 'Genre should not exceed ' + maxLength + ' characters']
    },
    isbn: {
        type: String,
        required: [true, 'Book ISBN code is required'],
        trim: true,
    },
    publishmentYear: {
        type: Number,
        required: [true, 'Publishment year is required']
    },
    edition: {
        type: String,
        trim: true,
        default: 'Paperback'
    },
    totalBorrows: {
        type: Number,
        defualt: 0
    },
    borrowers: [{
        type: String,
        minLength: [minUsernameLength, 'Username of Borrower must be at least ' + minUsernameLength + ' characters long'],
        maxLength: [maxUsernameLength, 'Username of Borrower should not exceed ' + maxUsernameLength + ' characters']
    }],
    records: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Records'
    }],
    coverImage: {
        type: String,
        required: [true, "Book's Cover Image is required"]
    }
}, { timestamps: true });

const Books = mongoose.model('Books', BookSchema);

const allBookFields = [
    'bookId', 'title', 'author', 'miniDescription', 'description', 'cost', 'isbn',
    'totalCopies', 'availableCopies', 'pages', 'genre', 'publishmentYear', 'borrowers', 'edition', 'totalBorrows', 'records', 'coverImage'
];
const bookFieldsInputs = [
    'bookId','title', 'author', 'miniDescription', 'description', 'cost', 'isbn',
    'totalCopies', 'availableCopies', 'genre', 'publishmentYear', 'coverImage'
];

/* Input Object :
{
    "title": "Atomic Habits",
    "author": "James Clear",
    "miniDescription": "A groundbreaking book on habit formation and personal growth.",
    "description": "Atomic Habits provides an easy-to-understand framework for building good habits and breaking bad ones. James Clear explores the science behind habit formation and offers actionable strategies to make incremental changes that lead to massive personal and professional improvements.",
    "cost": 15,
    "totalCopies": 3,
    "genre": "Self-Help",
    "coverImage": "https://example.com/images/atomic_habits.jpg"
}
*/

/* Final Object :
{
    "title": "Atomic Habits",
    "author": "James Clear",
    "miniDescription": "A groundbreaking book on habit formation and personal growth.",
    "description": "Atomic Habits provides an easy-to-understand framework for building good habits and breaking bad ones. James Clear explores the science behind habit formation and offers actionable strategies to make incremental changes that lead to massive personal and professional improvements.",
    "cost": 15,
    "totalCopies": 3,
    "availableCopies": 3,
    "genre": "Self-Help",
    "borrowers": [
        "arthur_morgan",
        "john_marston"
    ], // not required
    "records": [
        "64b765f7a5c5e4e1b1234567",
        "64b765f7a5c5e4e1b1234568"
    ], // not required
    "coverImage": "https://example.com/images/atomic_habits.jpg"
}
*/

export default Books;
export { Books, allBookFields, bookFieldsInputs };