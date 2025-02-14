import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const hashPassword = async (password) => {
    const saltingRounds = parseInt(process.env.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltingRounds);
    return hashedPassword;
};

const isValidPassword = async (plainTextPassword, hashedPassword) => {
    const isValid = await bcrypt.compare(plainTextPassword, hashedPassword);
    return isValid;
};

export default hashPassword;
export { hashPassword, isValidPassword };