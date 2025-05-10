import mongoose from 'mongoose';

const minUsernameLength = 8;
const maxUsernameLength = 20;

const minTitleLength = 3;
const maxTitleLength = 30;

const bioMaxLength = 100;

const minPasswordLength = 8;
const maxPasswordLength = 100;

const maxNameLength = 20;

const mobileNoLength = 10;
const zipCodeLength = 5;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileNoRegex = /^\d{10}$/;
const zipCodeRegex = /^\d{5}$/;

// User Schema
// TODO: Think of adding an array of three elements having genres that could be used to recommend the user the books of their fav genres
const UserSchema = new mongoose.Schema({
    username: { // pseudo primary key
        type: String,
        required: [true, 'Username is required'],
        unique: [true, 'Username must be unique'],
        trim: true,
        minLength: [minUsernameLength, 'Username must be at least ' + minUsernameLength + ' characters long'],
        maxLength: [maxUsernameLength, 'Username should not exceed ' + maxUsernameLength + ' characters']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        trim: true,
        minLength: [minPasswordLength, 'Password must be at least ' + minPasswordLength + ' characters long'],
        maxLength: [maxPasswordLength, 'Password should not exceed ' + maxPasswordLength + ' characters']
    },
    firstName: {
        type: String,
        required: [true, 'First Name is required'],
        trim: true,
        maxLength: [maxNameLength, 'First Name should not exceed ' + maxNameLength + ' characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last Name is required'],
        trim: true,
        maxLength: [maxNameLength, 'Last Name should not exceed ' + maxNameLength + ' characters']
    },
    bio: {
        type: String,
        trim: true,
        maxLength: [bioMaxLength, 'Bio should not exceed ' + bioMaxLength + ' characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email must be unique'],
        trim: true,
        match: [emailRegex, 'Please enter a valid email address']
    },
    mobileNo: {
        type: String,
        required: [true, 'Mobile number is required'],
        unique: [true, 'Mobile number must be unique'],
        trim: true,
        match: [mobileNoRegex, 'Mobile number must be exactly ' + mobileNoLength + ' digits']
    },
    address: {
        house: { type: String, required: [true, 'House address is required'], trim: true },
        street: { type: String, required: [true, 'Street address is required'], trim: true },
        landmark: { type: String, required: [true, 'Landmark address is required'], trim: true },
        city: { type: String, required: [true, 'City is required'], trim: true },
        state: { type: String, required: [true, 'State is required'], trim: true },
        zipCode: {
            type: String,
            required: [true, 'ZIP code is required'],
            match: [zipCodeRegex, 'ZIP code must be exactly ' + zipCodeLength + ' digits']
        }
    },
    borrowedBook: {
        type: String,
        default: null,
        trim: true,
        minLength: [minTitleLength, 'Title of Borrowed Book must be at least ' + minTitleLength + ' characters long'],
        maxLength: [maxTitleLength, 'Title of Borrowed Book should not exceed ' + maxTitleLength + ' characters']
    },
    borrowRecords: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Records'
    }],
    profileImage: {
        type: String,
        default: null
    },
    dashboardImage: {
        type: String,
        default: null
    }
    
}, { timestamps: true });

const Users = mongoose.model('Users', UserSchema);

const allUserFields = [
    'username', 'password', 'firstName', 'lastName', 'bio', 'email',
    'mobileNo', 'address', 'borrowedBook', 'borrowRecords',
    'profileImage', 'dashboardImage'
];
const userFieldsInputs = [
    'username', 'password', 'firstName', 'lastName', 'bio', 'email',
    'mobileNo', 'address', 'profileImage', 'dashboardImage'
];

/* Input Object :
{
    "username": "arthur_morgan",
    "password": 12345678,
    "firstName": "Arthur",
    "lastName": "Morgan",
    "email": "morgan@gmail.com",
    "mobileNo": 1234567890,
    "address": {
        "house": "123A",
        "street": "Elm Street",
        "city": "Springfield",
        "state": "Illinois",
        "zipCode": "62704"
    }
}
*/

/* Final Object :
{
    "username": "arthur_morgan",
    "password": 12345678,
    "firstName": "Arthur",
    "lastName": "Morgan",
    "bio": "This is my Bio", // not required
    "email": "morgan@gmail.com",
    "mobileNo": 1234567890,
    "address": {
        "house": "123A",
        "street": "Elm Street",
        "city": "Springfield",
        "state": "Illinois",
        "zipCode": "62704"
    },
    "borrowedBook": "Atomic Habits", // not required
    "borrowRecords": [
        "64b765f7a5c5e4e1b1234567",
        "64b765f7a5c5e4e1b1234568"
    ], // not required
    "profileImage": "https://example.com/profiles/falak_chudasama.jpg", // not required
    "dashboardImage": "https://example.com/dashboards/falak_chudasama_banner.jpg" // not required
}
*/

export default Users;
export { Users, allUserFields, userFieldsInputs };