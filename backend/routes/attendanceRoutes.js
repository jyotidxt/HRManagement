import express from 'express';
import { markAttendance, getAttendanceByDate, getEmployeeAttendanceHistory } from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', markAttendance);
router.get('/date', getAttendanceByDate);
router.get('/employee/:id', getEmployeeAttendanceHistory);

export default router;
