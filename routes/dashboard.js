import express from 'express';
import { getDashboardSummary } from '../controllers/contracts';

const router = express.Router();

router.get('/dashboard-summary', getDashboardSummary);

export default router;
