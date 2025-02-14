import express from 'express';
import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const pageRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontend_dir = path.join(__dirname, '../../frontend');
const frontend_pages_dir = path.join(frontend_dir, 'pages');
const frontend_assets_dir = path.join(frontend_dir, 'assets');
const frontend_bg_images_dir = path.join(frontend_dir, 'background-images');
const main_pages_dir = path.join(frontend_pages_dir, 'main');
const authentication_pages_dir = path.join(frontend_pages_dir, 'authentication');
const book_pages_dir = path.join(frontend_pages_dir, 'book');
const components_pages_dir = path.join(frontend_pages_dir, 'components');
const styles_pages_dir = path.join(frontend_pages_dir, 'styles');
const user_pages_dir = path.join(frontend_pages_dir, 'user');

pageRouter.use(express.static(frontend_dir));
pageRouter.use(express.static(frontend_pages_dir));
pageRouter.use(express.static(frontend_assets_dir));
pageRouter.use(express.static(frontend_bg_images_dir));
pageRouter.use(express.static(main_pages_dir));
pageRouter.use(express.static(authentication_pages_dir));
pageRouter.use(express.static(book_pages_dir));
pageRouter.use(express.static(components_pages_dir));
pageRouter.use(express.static(styles_pages_dir));
pageRouter.use(express.static(user_pages_dir));

// Main pages
pageRouter.get('/', (req, res) => {
    return res.sendFile(path.join(main_pages_dir, 'landing.html'));
});
pageRouter.get('/landing', (req, res) => {
    return res.sendFile(path.join(main_pages_dir, 'landing.html'));
});
pageRouter.get('/home', (req, res) => {
    return res.sendFile(path.join(main_pages_dir, 'home.html'));
});
pageRouter.get('/adminHome', (req, res) => {
    return res.sendFile(path.join(main_pages_dir, 'adminHome.html'));
});

// Authentication pages
pageRouter.get('/login', (req, res) => {
    return res.sendFile(path.join(authentication_pages_dir, 'signin.html'));
});
pageRouter.get('/signin', (req, res) => {
    return res.sendFile(path.join(authentication_pages_dir, 'signin.html'));
});
pageRouter.get('/signup', (req, res) => {
    return res.sendFile(path.join(authentication_pages_dir, 'signup1.html'));
});
pageRouter.get('/signup1', (req, res) => {
    return res.sendFile(path.join(authentication_pages_dir, 'signup1.html'));
});
pageRouter.get('/signup2', (req, res) => {
    return res.sendFile(path.join(authentication_pages_dir, 'signup2.html'));
});
pageRouter.get('/signup3', (req, res) => {
    return res.sendFile(path.join(authentication_pages_dir, 'signup3.html'));
});

// Book pages
pageRouter.get('/book', (req, res) => {
    return res.sendFile(path.join(book_pages_dir, 'book.html'));
});
pageRouter.get('/addBook', (req, res) => {
    return res.sendFile(path.join(book_pages_dir, 'addBook.html'));
});

// User pages
pageRouter.get('/profile', (req, res) => {
    return res.sendFile(path.join(user_pages_dir, 'profile.html'));
});
pageRouter.get('/history', (req, res) => {
    return res.sendFile(path.join(user_pages_dir, 'history.html'));
});
pageRouter.get('/wishlist', (req, res) => {
    return res.sendFile(path.join(user_pages_dir, 'wishlist.html'));
});

// Error page
pageRouter.use((req, res) => {
    return res.sendFile(path.join(main_pages_dir, 'error.html'));
});

export default pageRouter;