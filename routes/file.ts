import { Router } from 'express';
import { saveFile, sendFile } from '../controllers/file.js';

const router = Router();

router.post('/files', saveFile);
router.post('/files/send', sendFile);

export default router;
