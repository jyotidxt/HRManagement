import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: String, // stored in YYYY-MM-DD format for consistency and query simplicity
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'On Leave'],
    required: true
  }
}, {
  timestamps: true
});

// Compound index to guarantee one attendance log per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
