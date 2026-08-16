import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add employee name'],
    trim: true
  },
  employeeId: {
    type: String,
    required: [true, 'Please add employee ID'],
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Please add department'],
    trim: true
  },
  designation: {
    type: String,
    required: [true, 'Please add designation'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add email'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add phone number'],
    trim: true
  },
  dateOfJoining: {
    type: Date,
    required: [true, 'Please add date of joining']
  },
  status: {
    type: String,
    required: [true, 'Please specify status'],
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
