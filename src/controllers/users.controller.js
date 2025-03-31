import Users from "../models/users.models.js";
import Records from "../models/records.models.js";
import { hashPassword, isValidPassword } from '../utils/passwordHashing.utils.js';
import { generateTokensUtil } from '../middlewares/jwt.middlewares.js';
import winstonLogger from "../utils/logger.utils.js";
import dotenv from 'dotenv';

// TODO: suppose a book is deleted then the records of that book must be deleted too

dotenv.config();
const imageUrlBase = `http://localhost:${process.env.PORT}/uploads/users/`;
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME).toString();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD).toString();

// utils
const addUserOneUtil = async (user, bypass) => {
    try {
        winstonLogger.info(`Util: Attempting to add user with username: ${user.username}`);

        if (!bypass) {
            const users = await findUsersUtil();
            for (let i = 0; i < users.length; i++) {
                if (users[i].username === user.username) {
                    throw new Error(`User with username '${user.username}' already exists`);
                }
            }
        }

        const hashedPassword = await hashPassword(user.password.toString());
        const newUser = await Users.create({
            username: user.username,
            password: hashedPassword,
            firstName: user.firstName,
            lastName: user.lastName,
            bio: user?.bio,
            email: user.email,
            mobileNo: user.mobileNo,
            address: {
                house: user.address.house,
                street: user.address.street,
                landmark: user.address.landmark,
                city: user.address.city,
                state: user.address.state,
                zipCode: user.address.zipCode
            },
            borrowedBook: user?.borrowedBook,
            borrowRecords: user.borrowRecords || [],
            profileImage: user?.profileImage,
            dashboardImage: user?.dashboardImage
        });

        if (!newUser) {
            winstonLogger.error('Util: Something went wrong while creating new user');
            throw new Error('Something went wrong');
        }

        winstonLogger.info(`Util: User ${user.username} added successfully`);
        return newUser;
    } catch (err) {
        winstonLogger.error(`Util: Error while creating new user '${user.username}' - ${err.message}`);
        throw new Error('Error while creating new User - ' + err.message);
    }
};

const findUsersUtil = async () => {
    try {
        winstonLogger.info("Util: Attempting to fetch all users");

        const users = await Users.find();
        if (users === null || users.length === 0) {
            winstonLogger.error("Util: No users found");
            throw new Error('No users found');
        }

        winstonLogger.info("Util: Successfully fetched all users");
        return users;
    } catch (err) {
        winstonLogger.error(`Util: Error while fetching all users - ${err.message}`);
        throw new Error('Error while fetching all users - ' + err.message);
    }
};

const findUserByUsernameUtil = async (username) => {
    try {
        winstonLogger.info(`Util: Attempting to fetch user with username: ${username}`);

        const user = await Users.findOne({ username });
        if (!user) {
            winstonLogger.error(`Util: User with username '${username}' not found`);
            throw new Error(`User with username '${username}' not found`);
        }

        winstonLogger.info("Util: Successfully fetched user with username: " + username);
        return user;
    } catch (err) {
        winstonLogger.error(`Util: Error while fetching user by username - ${err.message}`);
        throw new Error('Error while fetching user by username - ' + err.message);
    }
};

const findUserByEmailUtil = async (email) => {
    try {
        winstonLogger.info(`Util: Attempting to fetch user by email: ${email}`);

        const user = await Users.findOne({ email });
        if (!user) {
            winstonLogger.error(`Util: User with email '${email}' not found`);
            throw new Error(`User with email '${email}' not found`);
        }

        winstonLogger.info("Util: Successfully fetched user by email");
        return user;
    } catch (err) {
        winstonLogger.error(`Util: Error while fetching user by email - ${err.message}`);
        throw new Error('Error while fetching user via email: ' + err.message);
    }
};

const findUserByMobileNoUtil = async (mobileNo) => {
    try {
        winstonLogger.info(`Util: Attempting to fetch user by mobile number: ${mobileNo}`);

        const user = await Users.findOne({ mobileNo });
        if (!user) {
            winstonLogger.error(`Util: User with mobile number '${mobileNo}' not found`);
            throw new Error(`User with mobile number '${mobileNo}' not found`);
        }

        winstonLogger.info("Util: Successfully fetched user by mobile number");
        return user;
    } catch (err) {
        winstonLogger.error(`Util: Error while fetching user by mobile number - ${err.message}`);
        throw new Error('Error while fetching user via mobile number: ' + err.message);
    }
};

const updateUploadImageUtil = async (username, imageType, imageUrl, bypass) => {
    try {
        winstonLogger.info(`Attempting to update ${imageType} for user with username '${username}'`);

        if (!bypass) {
            const user = await findUserByUsernameUtil(username);
            if (!user) {
                throw new Error(`User with username '${username}' not found`);
            }
        }

        let updatedUser;
        if (imageType === 'profile') {
            updatedUser = await Users.updateOne(
                { username },
                {
                    $set: { profileImage: imageUrl }
                },
                { new: true }
            );
            winstonLogger.info(`Util: Successfully updated the ${imageType} image of user with username '${username}'`);
            return updatedUser;
        } else if (imageType === 'dashboard') {
            updatedUser = await Users.updateOne(
                { username },
                {
                    $set: { dashboardImage: imageUrl }
                },
                { new: true }
            );
            winstonLogger.info(`Util: Successfully updated the ${imageType} image of user with username '${username}'`);
            return updatedUser;
        }
    } catch (err) {
        winstonLogger.error('Util: Error while updating image for user: ' + err);
        throw new Error('Error while updating image for user: ' + err);
    }
};

const updateUserBorrowsBookUtil = async (username, bookTitle, recordId, bypass) => {
    try {
        winstonLogger.info(`Util: Attempting to update borrow record for user: ${username}`);

        if (!bypass) {
            const user = await findUserByUsernameUtil(username);

            if (!user) {
                throw new Error(`User with username '${username}' not found`);
            }
            if (user.borrowedBook != null) {
                throw new Error(`User with username '${username}' already has a borrowed book: '${user.borrowedBook}'`);
            }
        }

        const updatedUser = await Users.findOneAndUpdate(
            { username },
            {
                $set: { borrowedBook: bookTitle },
                $addToSet: { borrowRecords: recordId }
            },
            { new: true }
        );

        if (!updatedUser) {
            throw new Error(`Something went wrong while updating user with username '${username}'`);
        }

        winstonLogger.info(`Util: User ${username} successfully updated with borrowed book: '${bookTitle}'`);
        return updatedUser;
    } catch (err) {
        winstonLogger.error(`Util: Error while updating user with username '${username}' - ${err.message}`);
        throw new Error(`Error while updating user with username '${username}' - ` + err.message);
    }
};

const updateUserReturnsBookUtil = async (username, bypass) => {
    try {
        winstonLogger.info(`Util: Attempting to update return record for user: ${username}`);

        if (!bypass) {
            const user = await findUserByUsernameUtil(username);
            if (user.borrowedBook === null) {
                throw new Error(`User with username '${username}' has no book to return`);
            }
        }

        const updatedUser = await Users.findOneAndUpdate(
            { username },
            {
                $set: { borrowedBook: null }
            },
            { new: true }
        );

        if (!updatedUser) {
            throw new Error(`Something went wrong while updating the return record for user '${username}'`);
        }

        winstonLogger.info(`Util: User ${username} has successfully returned the book`);
        return updatedUser;
    } catch (err) {
        winstonLogger.error(`Util: Error while updating user return record for '${username}' - ${err.message}`);
        throw new Error(`Error while updating user return record for '${username}' - ` + err.message);
    }
};

const deleteUserUtil = async (username, bypass) => {
    try {
        winstonLogger.info(`Util: Attempting to delete user: ${username}`);

        if (!bypass) {
            const user = await findUserByUsernameUtil(username);
            if (user === null) {
                throw new Error(`User with username '${username}' not found`);
            }
            if (user.borrowedBook !== null) {
                throw new Error(`Could not delete the user with username '${username}' because they still have a book with title '${user.borrowedBook}'`);
            }
        }

        const deletedRecords = await Records.deleteMany({ username });
        const deletedUser = await Users.findOneAndDelete({ username });

        if (!deletedUser) {
            throw new Error(`Something went wrong while deleting the user '${username}'`);
        }

        winstonLogger.info(`Util: User ${username} deleted successfully`);
        return deletedUser;
    } catch (err) {
        winstonLogger.error(`Util: Error while deleting user '${username}' - ${err.message}`);
        throw new Error(`Error while deleting user '${username}' - ` + err.message);
    }
};

// POST operations
const addUserOne = async (req, res) => {
    try {
        const { username } = req.body;
        winstonLogger.info(`Attempting to add new user: ${username}`);

        const users = await Users.find();

        for (let i = 0; i < users.length; i++) {
            if (users[i].username === username) {
                winstonLogger.error(`User with username '${username}' already exists`);
                return res.status(400).json({ message: `User with username '${username}' already exists` });
            }
        }

        const newUser = await addUserOneUtil(req.body, true);
        if (!newUser) {
            winstonLogger.error('Failed to create the new user');
            return res.status(500).json({ message: 'Failed to create the new user' });
        }

        winstonLogger.info(`User ${username} added successfully`);
        return res.status(201).json({ user: newUser, message: `User with username '${newUser.username}'` });
    } catch (err) {
        const statusCode = err.message.includes('already exists') ? 409 : 500;
        winstonLogger.error(`Error adding user: ${err.message}`);
        return res.status(statusCode).json({ error: err.message });
    }
};

// const addUserMany = async (req, res) => {
//     const users = req.body;
//     let newUsers = [];
//     let errors = [];

//     for (let i = 0; i < users.length; i++) {
//         try {
//             const user = users[i];
//             winstonLogger.info(`Attempting to add user: ${user.username}`);
//             const newUser = await addUserOneUtil(user, false);

//             if (!newUser) {
//                 throw new Error('Failed to create user');
//             }

//             winstonLogger.info(`User ${user.username} added successfully`);
//             newUsers.push(newUser);
//         } catch (err) {
//             errors.push({
//                 user: users[i],
//                 error: err.message,
//             });
//             winstonLogger.error(`Error adding user: ${users[i].username} - ${err.message}`);
//         }
//     }

//     if (newUsers.length === 0) {
//         winstonLogger.error('Error adding users: ' + JSON.stringify(errors));
//         return res.status(400).json({
//             message: 'No users were added',
//             errors
//         });
//     } else if (errors.length > 0) {
//         winstonLogger.warn('Partial success while adding users');
//         winstonLogger.info('Users added successfully: ' + JSON.stringify(newUsers));
//         return res.status(207).json({
//             message: 'Some users were not added',
//             errors,
//             newUsers
//         });
//     } else {
//         winstonLogger.info('Users added successfully: ' + JSON.stringify(newUsers));
//         return res.status(201).json({
//             message: 'All users were added successfully',
//             newUsers
//         });
//     }
// };

const registerUser = async (req, res) => {
    try {
        const { username } = req.body;
        winstonLogger.info(`Attempting to register a new user: ${username}`);

        if (username === ADMIN_USERNAME) {
            winstonLogger.error(`User tried to register as Admin`);
            return res.status(400).json({ message: `User with username '${username}' already exists` });
        }

        const users = await Users.find();

        for (let i = 0; i < users.length; i++) {
            if (users[i].username === username) {
                winstonLogger.error(`User with username '${username}' already exists`);
                return res.status(400).json({ message: `User with username '${username}' already exists` });
            }
        }

        const newUser = await addUserOneUtil(req.body, true);
        if (!newUser) {
            winstonLogger.error('Failed to register a new user: ' + username);
            return res.status(500).json({ message: 'Failed to register a new user: ' + username });
        }

        const { accessToken, refreshToken } = await generateTokensUtil(username);

        winstonLogger.info(`User ${username} added successfully`);
        return res.status(201).json({ user: newUser, accessToken, refreshToken, message: `User with username '${newUser.username}' successfully registered` });
    } catch (err) {
        const statusCode = err.message.includes('already exists') ? 409 : 500;
        winstonLogger.error(`Error adding user: ${err.message}`);
        return res.status(statusCode).json({ error: err.message });
    }
};

const loginUser = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        winstonLogger.info(`Logging in the user by username: ${username}`);

        if (!username) {
            winstonLogger.error(`No username was included in the request`);
            return res.status(400).json({ message: `No username was included in the request` });
        }
        if (!password) {
            winstonLogger.error(`User with username '${username}' has not included password in the request`);
            return res.status(400).json({ message: `User with username '${username}' has not included password in the request` });
        }

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            const { accessToken, refreshToken } = await generateTokensUtil(username);
            winstonLogger.info(`Admin logged in successfully`);
            return res.status(200).json({ accessToken, refreshToken, message: `Admin logged in successfully` });
        } else if (username === ADMIN_USERNAME && password !== ADMIN_PASSWORD) {
            winstonLogger.error('Admin entered wrong password');
            return res.status(401).json({ message: `User with username '${username}' entered wrong password` });
        }

        const user = await findUserByUsernameUtil(username);

        if (!user) {
            winstonLogger.error(`User with username '${username}' not found`);
            return res.status(404).json({ message: `User with username '${username}' not found` });
        }

        const validityOfPassword = await isValidPassword(password.toString(), user.password);
        if (!validityOfPassword) {
            winstonLogger.error(`User with username '${username}' entered wrong password`);
            return res.status(401).json({ message: `User with username '${username}' entered wrong password` });
        }

        const { accessToken, refreshToken } = await generateTokensUtil(username);

        winstonLogger.info(`User with username '${username}' logged in successfully`);
        return res.status(200).json({ user: user, accessToken, refreshToken, message: `Successfully user '${username}' logged in` });
    } catch (err) {
        if (err.message.includes('not found')) {
            winstonLogger.error(`User with username '${username}' not found`);
            return res.status(404).json({ error: `User with username '${username}' not found` });
        }
        winstonLogger.error(`Error fetching user by username '${username}': ${err.message}`);
        return res.status(500).json({ error: 'Internal server error while fetching user: ' + err.message });
    }
};

// GET operations
const findUsers = async (req, res) => {
    try {
        winstonLogger.info("Fetching all users");
        const users = await findUsersUtil();

        winstonLogger.info('Successfully fetched users');
        return res.status(200).json(users);
    } catch (err) {
        if (err.message.includes('No users found')) {
            winstonLogger.info("No users found");
            return res.status(404).json({ message: 'No users were found' });
        }
        winstonLogger.error(`Error fetching users: ${err.message}`);
        return res.status(500).json({ error: 'Internal server error while fetching users' });
    }
};


const findUserByUsername = async (req, res) => {
    if (!req.user) {
        winstonLogger.error('User was not authenticated');
        return res.status(500).json({ message: 'User was not authenticated' });
    }
    const username = req.user.username;
    try {
        winstonLogger.info(`Fetching user by username: ${username}`);

        const user = await findUserByUsernameUtil(username);

        if (!user) {
            winstonLogger.error(`User with username '${username}' not found`);
            return res.status(404).json({ message: `User with username '${username}' not found` });
        }

        winstonLogger.info(`User with username '${username}' fetched successfully`);
        return res.status(200).json({ user: user, message: `Successfully fetched user '${user.username}'` });
    } catch (err) {
        if (err.message.includes('not found')) {
            winstonLogger.error(`User with username '${username}' not found`);
            return res.status(404).json({ message: `User with username '${username}' not found` });
        }
        winstonLogger.error(`Error fetching user by username '${username}': ${err.message}`);
        return res.status(500).json({ error: 'Internal server error while fetching user: ' + err.message });
    }
};

const findUserByEmail = async (req, res) => {
    try {
        winstonLogger.info(`Fetching user by email: ${req.params.email}`);

        const user = await findUserByEmailUtil(req.params.email);

        if (!user) {
            winstonLogger.error(`User with email '${req.params.email}' not found`);
            return res.status(404).json({ error: `User with email '${req.params.email}' not found` });
        }

        winstonLogger.info(`User with email '${req.params.email}' fetched successfully`);
        return res.status(200).json(user);
    } catch (err) {
        if (err.message.includes('not found')) {
            winstonLogger.error(`User with email '${req.params.email}' not found`);
            return res.status(404).json({ error: `User with email '${req.params.email}' not found` });
        }
        winstonLogger.error(`Error fetching user by email '${req.params.email}': ${err.message}`);
        return res.status(500).json({ error: 'Internal server error while fetching user' });
    }
};


const findUserByMobileNo = async (req, res) => {
    try {
        winstonLogger.info(`Fetching user by mobileNo: ${req.params.mobileNo}`);

        const user = await findUserByMobileNoUtil(req.params.mobileNo);

        if (!user) {
            winstonLogger.error(`User with mobileNo '${req.params.mobileNo}' not found`);
            return res.status(404).json({ error: `User with mobileNo '${req.params.mobileNo}' not found` });
        }

        winstonLogger.info(`User with mobileNo '${req.params.mobileNo}' fetched successfully`);
        return res.status(200).json(user);
    } catch (err) {
        if (err.message.includes('not found')) {
            winstonLogger.error(`User with mobileNo '${req.params.mobileNo}' not found`);
            return res.status(404).json({ error: `User with mobileNo '${req.params.mobileNo}' not found` });
        }
        winstonLogger.error(`Error fetching user by mobileNo '${req.params.mobileNo}': ${err.message}`);
        return res.status(500).json({ error: 'Internal server error while fetching user' });
    }
};

// PATCH operation
const updateUploadImage = async (req, res) => {
    try {
        winstonLogger.info(`Attempting to upload profile/dashboard image of user`);
        if (!req.user) {
            winstonLogger.error('User was not authenticated');
            return res.status(500).json({ message: 'User was not authenticated' });
        }
        if (!req.file) {
            winstonLogger.error(`No image file was provided`);
            return res.status(400).json({ message: `No image file was provided` });
        }

        const { username } = req.user;
        const imageType = req.get('imageType');
        const fileName = req.file.filename;

        const user = await findUserByUsernameUtil(username);
        if (!user) {
            winstonLogger.error(`User with username '${username}' not found`);
            return res.status(404).json({ message: `User with username '${username}' not found` });
        }

        const imageUrl = `${imageUrlBase}${fileName}`;

        const updatedUser = await updateUploadImageUtil(username, imageType, imageUrl, true);

        if (!updatedUser) {
            throw new Error(`Failed to update the ${imageType} user with username '${username}'`);
        }

        winstonLogger.info(`Successfully added image '${fileName}' to user with username '${username}'`);
        return res.status(200).json({ updatedUser });
    } catch (err) {
        winstonLogger.error(`Error while updating the image for user: ${err}`);
        return res.status(400).json({ error: err.message });
    }
};

const updateUserBorrowsBook = async (req, res) => {
    if (!req.user) {
        winstonLogger.error('User was not authenticated');
        return res.status(500).json({ message: 'User was not authenticated' });
    }
    const username = req.user;
    const { bookTitle, recordId } = req.body;

    try {
        winstonLogger.info(`User ${username} attempting to borrow book '${bookTitle}'`);

        const user = await findUserByUsernameUtil(username);

        if (!user) {
            winstonLogger.error(`User with username '${username}' not found`);
            return res.status(404).json({ message: `User with username '${username}' not found` });
        }

        if (user.borrowedBook != null) {
            winstonLogger.error(`User with username '${username}' already has a borrowed book: '${user.borrowedBook}'`);
            return res.status(409).json({ message: `User with username '${username}' already has a borrowed book: '${user.borrowedBook}'` });
        }

        const updatedUser = await updateUserBorrowsBookUtil(username, bookTitle, recordId, true);

        if (!updatedUser) {
            throw new Error(`Failed to update the user with borrowed book '${bookTitle}'`);
        }

        winstonLogger.info(`Successfully updated user ${username} with borrowed book '${bookTitle}'`);
        return res.status(201).json(updatedUser);
    } catch (err) {
        winstonLogger.error(`Error borrowing book for user '${username}': ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
};


const updateUserReturnsBook = async (req, res) => {
    const { username } = req.params;

    try {
        winstonLogger.info(`User ${username} attempting to return a book`);

        const user = await findUserByUsernameUtil(username);

        if (!user) {
            winstonLogger.error(`User with username '${username}' not found`);
            return res.status(404).json({ message: `User with username '${username}' not found` });
        }

        if (user.borrowedBook === null) {
            winstonLogger.error(`User with username '${username}' has no book to return`);
            return res.status(409).json({ message: `User with username '${username}' has no book to return` });
        }

        const updatedUser = await updateUserReturnsBookUtil(username, true);

        if (!updatedUser) {
            throw new Error('Failed to update the user after returning the book');
        }

        winstonLogger.info(`User ${username} successfully returned the book`);
        return res.status(200).json(updatedUser);
    } catch (err) {
        winstonLogger.error(`Error returning book for user '${username}': ${err.message}`);
        return res.status(400).json({ error: err.message });
    }
};

// DELETE operation
const deleteUser = async (req, res) => {
    const { username } = req.user;

    try {
        winstonLogger.info(`Attempting to delete user: ${username}`);

        const user = await findUserByUsernameUtil(username);
        if (!user) {
            winstonLogger.error(`User with username '${username}' not found`);
            return res.status(404).json({ message: `User with username '${username}' not found` });
        }

        if (user.borrowedBook !== null) {
            winstonLogger.error(`Could not delete the user with username '${username}' because they still have a book with title '${user.borrowedBook}'`);
            return res.status(409).json({ message: `User '${username}' still has the book titled '${user.borrowedBook}', so deletion is not allowed.` });
        }

        const deletedUser = await deleteUserUtil(username, true);

        if (!deletedUser) {
            throw new Error('Something went wrong while deleting the user');
        }

        winstonLogger.info(`User with username '${username}' has been deleted successfully`);
        return res.status(200).json({ message: `User '${username}' has been deleted successfully.` });
    } catch (err) {
        winstonLogger.error(`Error deleting user with username '${username}': ${err.message}`);
        return res.status(400).json({ error: err.message });
    }
};

export default addUserOne;
export {
    loginUser,
    registerUser,
    addUserOneUtil,
    addUserOne,
    // addUserMany,
    findUsersUtil,
    findUsers,
    findUserByUsernameUtil,
    findUserByUsername,
    findUserByEmailUtil,
    findUserByEmail,
    findUserByMobileNoUtil,
    findUserByMobileNo,
    updateUploadImageUtil,
    updateUploadImage,
    updateUserBorrowsBookUtil,
    updateUserBorrowsBook,
    updateUserReturnsBookUtil,
    updateUserReturnsBook,
    deleteUserUtil,
    deleteUser
};