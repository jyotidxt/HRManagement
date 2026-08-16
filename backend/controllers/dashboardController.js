import Employee from '../models/employee.js';
import Attendance from '../models/attendance.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Employees & Status Count
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'Active' });
    const inactiveEmployees = totalEmployees - activeEmployees;

    // 2. Department-wise Headcount
    const departmentStats = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          department: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // 3. Attendance Stats for a specific date (defaults to today)
    const { date } = req.query;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const targetDateString = date || `${yyyy}-${mm}-${dd}`;

    const dateAttendance = await Attendance.find({ date: targetDateString });
    
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;

    dateAttendance.forEach(record => {
      if (record.status === 'Present') presentCount++;
      else if (record.status === 'Absent') absentCount++;
      else if (record.status === 'On Leave') leaveCount++;
    });

    const unmarkedCount = Math.max(0, activeEmployees - dateAttendance.length);

    return res.json({
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      departmentStats,
      attendanceStats: {
        date: targetDateString,
        present: presentCount,
        absent: absentCount,
        onLeave: leaveCount,
        unmarked: unmarkedCount
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
