import { Router } from 'express';
import { showFile, downloadFile } from '../controllers/file.js';

const router = Router();

router.get('/:uuid', showFile);
router.get('/download/:uuid', downloadFile);

export default router;
