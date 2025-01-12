import express from 'express';
import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const pageRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontend_pages_dir = path.join(__dirname, '../../FrontEnd', 'pages');
pageRouter.use(express.static(frontend_pages_dir));

// GET
pageRouter.get('/', (req, res) => {
    return res.sendFile(path.join(frontend_pages_dir, 'landing.html'));
});

pageRouter.get('/home', (req, res) => {
    return res.sendFile(path.join(frontend_pages_dir, 'home.html'));
});

export default pageRouter;