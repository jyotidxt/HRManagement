import Employee from '../models/employee.js';
import Attendance from '../models/attendance.js';

// @desc    Get all employees with optional search and filter
// @route   GET /api/employees
// @access  Private
export const getEmployees = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    let query = {};

    // Search query (name or employeeId)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by department
    if (department && department !== 'All') {
      query.department = department;
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 });
    return res.json(employees);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get single employee details
// @route   GET /api/employees/:id
// @access  Private
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    return res.json(employee);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private
export const createEmployee = async (req, res) => {
  const { name, employeeId, department, designation, email, phone, dateOfJoining, status } = req.body;

  try {
    const employeeExists = await Employee.findOne({ employeeId });
    if (employeeExists) {
      return res.status(400).json({ message: 'Employee with this ID already exists' });
    }

    const employee = new Employee({
      name,
      employeeId,
      department,
      designation,
      email,
      phone,
      dateOfJoining,
      status
    });

    const createdEmployee = await employee.save();
    return res.status(201).json(createdEmployee);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private
export const updateEmployee = async (req, res) => {
  const { name, employeeId, department, designation, email, phone, dateOfJoining, status } = req.body;

  try {
    const employee = await Employee.findById(req.params.id);

    if (employee) {
      // Check if employeeId is changed and if it is unique
      if (employeeId && employeeId !== employee.employeeId) {
        const idExists = await Employee.findOne({ employeeId });
        if (idExists) {
          return res.status(400).json({ message: 'Employee with this ID already exists' });
        }
      }

      employee.name = name || employee.name;
      employee.employeeId = employeeId || employee.employeeId;
      employee.department = department || employee.department;
      employee.designation = designation || employee.designation;
      employee.email = email || employee.email;
      employee.phone = phone || employee.phone;
      employee.dateOfJoining = dateOfJoining || employee.dateOfJoining;
      employee.status = status || employee.status;

      const updatedEmployee = await employee.save();
      return res.json(updatedEmployee);
    } else {
      return res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an employee
// @route   DELETE /api/employees/:id
// @access  Private
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (employee) {
      // Cascade delete all attendance records associated with this employee
      await Attendance.deleteMany({ employee: req.params.id });
      
      await Employee.deleteOne({ _id: req.params.id });
      return res.json({ message: 'Employee removed successfully' });
    } else {
      return res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
