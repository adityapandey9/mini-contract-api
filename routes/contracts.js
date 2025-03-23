import express from 'express';
import multer from 'multer';

import { createContract, uploadContracts, getContracts, updateContract, deleteContract } from '../controllers/contracts.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', createContract);
router.post('/upload', upload.single('file'), uploadContracts);
router.put('/:id', updateContract);
router.get('/', getContracts);
router.delete('/:id', deleteContract);

export default router;
