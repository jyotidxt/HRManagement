import Attendance from '../models/attendance.js';
import Employee from '../models/employee.js';

// @desc    Mark or update attendance for an employee
// @route   POST /api/attendance
// @access  Private
export const markAttendance = async (req, res) => {
  const { employeeId, date, status } = req.body; // employeeId is MongoDB _id

  if (!employeeId || !date || !status) {
    return res.status(400).json({ message: 'Please provide employeeId, date, and status' });
  }

  try {
    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Upsert (update or insert) attendance record
    const attendance = await Attendance.findOneAndUpdate(
      { employee: employeeId, date },
      { status },
      { new: true, upsert: true }
    );

    return res.status(200).json(attendance);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// @desc    Get attendance records for all employees on a specific date
// @route   GET /api/attendance/date
// @access  Private
export const getAttendanceByDate = async (req, res) => {
  const { date } = req.query; // format: YYYY-MM-DD

  if (!date) {
    return res.status(400).json({ message: 'Please provide a date query parameter (YYYY-MM-DD)' });
  }

  try {
    const attendanceRecords = await Attendance.find({ date }).populate('employee', 'name employeeId department status');
    return res.json(attendanceRecords);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance history for a single employee
// @route   GET /api/attendance/employee/:id
// @access  Private
export const getEmployeeAttendanceHistory = async (req, res) => {
  try {
    const history = await Attendance.find({ employee: req.params.id }).sort({ date: -1 });
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
