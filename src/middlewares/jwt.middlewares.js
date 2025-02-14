import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import winstonLogger from '../utils/logger.utils.js';

dotenv.config();

const TOKEN_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRATION = process.env.JWT_ACCESS_TOKEN_EXPIRATION;
const REFRESH_TOKEN_EXPIRATION = process.env.JWT_REFRESH_TOKEN_EXPIRATION;

/* the req object: 
fetch(<url>, {
    method: <method>
    header: {
        'Authorization': Bearer <accessToken>,
    },
    body: <body>
})
*/

const authenticateToken = async (req, res, next) => {
    winstonLogger.info('Authenticating the User access token');
    const authHeader = req.header('Authentication');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        winstonLogger.error('Authentication failed: No access token found or token format is invalid');
        return res.status(401).json({ message: 'Access denied: Missing or invalid access token' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const verified = jwt.verify(token, TOKEN_SECRET);
        req.user = verified;
        winstonLogger.info(`Successfully authenticated user with username '${req.user.username}'`);
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            winstonLogger.error('Access token authentication failed: Token expired');
            return res.status(401).json({ message: 'Access token expired. Please refresh the token.' });
        }
        winstonLogger.error('Access token authentication failed: Invalid token');
        return res.status(403).json({ message: 'Invalid Access Token' });
    }
};

const generateTokens = async (req, res) => {
    const { username } = req.body;
    winstonLogger.info(`Generating tokens for user with username '${username}'`);
    try {
        const accessToken = jwt.sign({ username }, TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
        const refreshToken = jwt.sign({ username }, TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });

        winstonLogger.info(`Successfully generated tokens for user with username '${username}'`);
        res.status(200).json({
            tokens: { accessToken, refreshToken },
            message: `Tokens generated successfully for user '${username}'`,
        });
    } catch (err) {
        winstonLogger.error(`Error generating tokens for user '${username}': ${err.message}`);
        res.status(500).json({ message: `Error generating tokens: ${err.message}` });
    }
};

const refreshToken = async (req, res) => {
    winstonLogger.info('Processing token refresh request');
    const { refreshToken } = req.body;

    if (!refreshToken) {
        winstonLogger.error('Token refresh failed: No refresh token provided');
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
        const verified = jwt.verify(refreshToken, TOKEN_SECRET);
        const username = verified.username;

        const accessToken = jwt.sign({ username }, TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });

        winstonLogger.info(`Successfully refreshed access token for user '${username}'`);
        res.status(200).json({
            accessToken,
            message: `Access token refreshed successfully for user '${username}'`,
        });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            winstonLogger.error('Token refresh failed: Refresh token expired');
            return res.status(401).json({ message: 'Refresh token expired. Please log in again.' });
        }
        winstonLogger.error('Token refresh failed: Invalid refresh token');
        return res.status(403).json({ message: 'Invalid Refresh Token' });
    }
};

const generateTokensUtil = async (username) => {
    winstonLogger.info(`Util: Generating tokens for user with username '${username}'`);
    try {
        const accessToken = jwt.sign({ username }, TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
        const refreshToken = jwt.sign({ username }, TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });

        winstonLogger.info(`Util: Successfully generated tokens for user with username '${username}'`);
        return { accessToken, refreshToken };
    } catch (err) {
        winstonLogger.error(`Util: Error generating tokens for user '${username}': ${err.message}`);
        throw new Error(`Error generating tokens: ${err.message}`);
    }
};

const refreshTokenUtil = async (refreshToken) => {
    winstonLogger.info('Util: Processing token refresh request');

    if (!refreshToken) {
        winstonLogger.error('Util: Token refresh failed: No refresh token provided');
        throw new Error('Refresh token is required');
    }

    try {
        const verified = jwt.verify(refreshToken, TOKEN_SECRET);
        const username = verified.username;

        const accessToken = jwt.sign({ username }, TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });

        winstonLogger.info(`Util: Successfully refreshed access token for user '${username}'`);
        return accessToken;
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            winstonLogger.error('Util: Token refresh failed: Refresh token expired');
            throw new Error('Refresh token expired. Please log in again.');
        }
        winstonLogger.error('Util: Token refresh failed: Invalid refresh token');
        throw new Error('Invalid Refresh Token');
    }
};

export default authenticateToken;
export {
    authenticateToken,
    generateTokensUtil,
    generateTokens,
    refreshTokenUtil,
    refreshToken
};