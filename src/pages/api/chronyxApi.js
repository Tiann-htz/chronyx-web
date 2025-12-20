//src/pages/api/chronyxApi.js
import { query } from '../../utils/db';

const handler = async (req, res) => {
  console.log('API handler called:', req.method, req.url);
  const { method } = req;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Action');

  // Handle OPTIONS request
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (method) {
      case 'POST':
        // Check for different actions via header
        const action = req.headers['x-action'];
        if (action === 'verify-pin') {
          await handleVerifyPin(req, res);
        } else if (action === 'record-attendance') {
          await handleRecordAttendance(req, res);
        } else if (action === 'calculate-payroll') {
          await handleCalculatePayroll(req, res);
        } else if (action === 'generate-payroll') {
          await handleGeneratePayroll(req, res);
        } else {
          // Default to admin login
          await handleAdminLogin(req, res);
        }
        break;
      
      case 'GET':
        // Check for different GET actions via header
        const getAction = req.headers['x-action'];
        if (getAction === 'get-employees') {
          await handleGetEmployees(req, res);
        } else if (getAction === 'get-recent-attendance') {
          await handleGetRecentAttendance(req, res);
        } else if (getAction === 'get-qr-codes') {
          await handleGetQRCodes(req, res);
        } else if (getAction === 'get-payroll-records') {
          await handleGetPayrollRecords(req, res);
        } else {
          await handleTestConnection(req, res);
        }
        break;
      
      default:
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing your request',
      details: error.message 
    });
  }
};

// Test database connection
async function handleTestConnection(req, res) {
  try {
    const result = await query('SELECT 1 as test');
    res.status(200).json({
      success: true,
      message: 'Database connection successful!',
      data: result
    });
  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      details: error.message
    });
  }
}

// Admin Login (Step 1: Username & Password)
async function handleAdminLogin(req, res) {
  try {
    const { username, password } = req.body;

    console.log('=== ADMIN LOGIN REQUEST ===');
    console.log('Username:', username);

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Query admin from database
    const admins = await query(
      'SELECT * FROM admin WHERE username = ? AND password = ?',
      [username, password]
    );

    console.log('Admin found:', admins.length);

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const admin = admins[0];

    // Return success with admin data (without pin)
    return res.status(200).json({
      success: true,
      message: 'Credentials verified. Please enter PIN.',
      requiresPin: true,
      adminId: admin.admin_id,
      adminName: admin.admin_name
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}

// Verify PIN (Step 2: PIN Verification)
async function handleVerifyPin(req, res) {
  try {
    const { adminId, pin } = req.body;

    console.log('=== PIN VERIFICATION REQUEST ===');
    console.log('Admin ID:', adminId);

    // Validate input
    if (!adminId || !pin) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID and PIN are required'
      });
    }

    // Query admin with PIN
    const admins = await query(
      'SELECT * FROM admin WHERE admin_id = ? AND pin = ?',
      [adminId, pin]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid PIN'
      });
    }

    const admin = admins[0];

    // Return success with full admin data
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      admin: {
        id: admin.admin_id,
        name: admin.admin_name,
        username: admin.username
      }
    });

  } catch (error) {
    console.error('PIN verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}

// Get All Employees
async function handleGetEmployees(req, res) {
  try {
    console.log('=== GET EMPLOYEES REQUEST ===');

    const employees = await query('SELECT * FROM employee ORDER BY created_at DESC');

    console.log('Employees found:', employees.length);

    return res.status(200).json({
      success: true,
      data: employees
    });

  } catch (error) {
    console.error('Get employees error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}

// Get Recent Attendance (Last 50 records)
async function handleGetRecentAttendance(req, res) {
  try {
    console.log('=== GET RECENT ATTENDANCE REQUEST ===');

    const attendance = await query(
      `SELECT 
        a.*,
        e.first_name,
        e.last_name,
        e.email,
        e.avatar_url
      FROM attendance a
      LEFT JOIN employee e ON a.employee_id = e.employee_id
      ORDER BY a.date DESC, a.time DESC 
      LIMIT 50`
    );

    console.log('Attendance records found:', attendance.length);
    if (attendance.length > 0) {
      console.log('Sample record:', {
        id: attendance[0].attendance_id,
        employee: `${attendance[0].first_name} ${attendance[0].last_name}`,
        date: attendance[0].date,
        time: attendance[0].time,
        action: attendance[0].action_type,
        avatar: attendance[0].avatar_url || 'No avatar'
      });
    }

    return res.status(200).json({
      success: true,
      data: attendance
    });

  } catch (error) {
    console.error('Get attendance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}

// Get All QR Codes
async function handleGetQRCodes(req, res) {
  try {
    console.log('=== GET QR CODES REQUEST ===');

    const qrCodes = await query('SELECT * FROM employee_qr ORDER BY created_at DESC');

    console.log('QR codes found:', qrCodes.length);

    return res.status(200).json({
      success: true,
      data: qrCodes
    });

  } catch (error) {
    console.error('Get QR codes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}

// Get All Payroll Records
async function handleGetPayrollRecords(req, res) {
  try {
    console.log('=== GET PAYROLL RECORDS REQUEST ===');

    const payrollRecords = await query(
  `SELECT p.*, e.first_name, e.last_name, e.email, e.avatar_url 
   FROM payroll p 
   JOIN employee e ON p.employee_id = e.employee_id 
   ORDER BY p.created_at DESC, p.period_start DESC`
);
    console.log('Payroll records found:', payrollRecords.length);

    return res.status(200).json({
      success: true,
      data: payrollRecords
    });

  } catch (error) {
    console.error('Get payroll records error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}

// Calculate Payroll
async function handleCalculatePayroll(req, res) {
  try {
    const { periodStart, periodEnd } = req.body;

    console.log('=== CALCULATE PAYROLL REQUEST ===');
    console.log('Period:', periodStart, 'to', periodEnd);

    // Validate input
    if (!periodStart || !periodEnd) {
      return res.status(400).json({
        success: false,
        message: 'Period start and end dates are required'
      });
    }

    // Get all employees with their hourly rates
    const employees = await query('SELECT employee_id, first_name, last_name, email, avatar_url, hourly_rate FROM employee');

    const payrollData = [];
    let totalHours = 0;
    let totalSalary = 0;

    for (const employee of employees) {
      // Get all attendance records for this employee in the period
      const attendanceRecords = await query(
        `SELECT date, action_type, time 
         FROM attendance 
         WHERE employee_id = ? 
         AND date BETWEEN ? AND ? 
         ORDER BY date, time`,
        [employee.employee_id, periodStart, periodEnd]
      );

      if (attendanceRecords.length === 0) {
        continue; // Skip employees with no attendance
      }

      // Group by date and calculate daily hours
      const dailyHours = {};
      const workDates = new Set();

      attendanceRecords.forEach(record => {
        const dateKey = record.date;
        if (!dailyHours[dateKey]) {
          dailyHours[dateKey] = { timeIn: null, timeOut: null };
        }

        if (record.action_type === 'time-in') {
          dailyHours[dateKey].timeIn = record.time;
        } else if (record.action_type === 'time-out') {
          dailyHours[dateKey].timeOut = record.time;
        }
      });

      // Calculate total hours worked
      let employeeTotalHours = 0;
      
      Object.keys(dailyHours).forEach(date => {
        const { timeIn, timeOut } = dailyHours[date];
        
        if (timeIn && timeOut) {
          workDates.add(date);
          // Convert time strings to hours
          const [inHour, inMin, inSec] = timeIn.split(':').map(Number);
          const [outHour, outMin, outSec] = timeOut.split(':').map(Number);
          
          const timeInMinutes = inHour * 60 + inMin;
          const timeOutMinutes = outHour * 60 + outMin;
          
          const workedMinutes = timeOutMinutes - timeInMinutes;
          const workedHours = workedMinutes / 60;
          
          if (workedHours > 0) {
            employeeTotalHours += workedHours;
          }
        }
      });

      if (employeeTotalHours > 0) {
        const grossSalary = employeeTotalHours * employee.hourly_rate;
        
        payrollData.push({
  employee_id: employee.employee_id,
  first_name: employee.first_name,
  last_name: employee.last_name,
  email: employee.email,
  avatar_url: employee.avatar_url,
  days_worked: workDates.size,
  total_hours: employeeTotalHours,
  hourly_rate: employee.hourly_rate,
  gross_salary: grossSalary
});

        totalHours += employeeTotalHours;
        totalSalary += grossSalary;
      }
    }

    console.log('Payroll calculated for', payrollData.length, 'employees');

    return res.status(200).json({
      success: true,
      data: payrollData,
      summary: {
        totalEmployees: payrollData.length,
        totalHours: totalHours,
        totalSalary: totalSalary
      }
    });

  } catch (error) {
    console.error('Calculate payroll error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}

// Generate Payroll Records
async function handleGeneratePayroll(req, res) {
  try {
    const { periodStart, periodEnd, payrollData } = req.body;

    console.log('=== GENERATE PAYROLL REQUEST ===');
    console.log('Period:', periodStart, 'to', periodEnd);
    console.log('Employees:', payrollData.length);

    // Validate input
    if (!periodStart || !periodEnd || !payrollData || payrollData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payroll data'
      });
    }

    // Insert payroll records
    for (const employee of payrollData) {
      await query(
        `INSERT INTO payroll 
         (employee_id, period_start, period_end, total_hours, hourly_rate, gross_salary, deductions, net_salary, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employee.employee_id,
          periodStart,
          periodEnd,
          employee.total_hours,
          employee.hourly_rate,
          employee.gross_salary,
          0.00, // No deductions for now
          employee.gross_salary, // Net salary = Gross salary (no deductions)
          'approved'
        ]
      );
    }

    console.log('✅ PAYROLL GENERATED SUCCESSFULLY!');
    console.log(`📋 Records created: ${payrollData.length}`);

    return res.status(200).json({
      success: true,
      message: 'Payroll generated successfully',
      recordsCreated: payrollData.length
    });

  } catch (error) {
    console.error('Generate payroll error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}

// Record Attendance
async function handleRecordAttendance(req, res) {
  try {
    const { qrCode, actionType } = req.body;

    console.log('=== ATTENDANCE RECORDING REQUEST ===');
    console.log('QR Code:', qrCode);
    console.log('Action Type:', actionType);

    // Validate input
    if (!qrCode || !actionType) {
      return res.status(400).json({
        success: false,
        message: 'QR Code and action type are required'
      });
    }

    // Validate action type
    if (actionType !== 'time-in' && actionType !== 'time-out') {
      return res.status(400).json({
        success: false,
        message: 'Invalid action type. Must be "time-in" or "time-out"'
      });
    }

    // Find employee by QR code
    const employeeQR = await query(
      'SELECT eq.*, e.first_name, e.last_name, e.email FROM employee_qr eq JOIN employee e ON eq.employee_id = e.employee_id WHERE eq.qr_code = ? AND eq.is_active = 1',
      [qrCode]
    );

    if (employeeQR.length === 0) {
      console.log('❌ QR Code not found or inactive');
      return res.status(404).json({
        success: false,
        message: 'QR Code not found or inactive'
      });
    }

    const employeeData = employeeQR[0];
    console.log('✓ Employee found:', employeeData.first_name, employeeData.last_name);

    // Get current date and time in Philippine timezone (UTC+8)
    const now = new Date();
    const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const date = phTime.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = phTime.toISOString().split('T')[1].split('.')[0]; // HH:MM:SS

    // Check if employee already has a time-in today (if recording time-in)
    if (actionType === 'time-in') {
      const existingTimeIn = await query(
        'SELECT * FROM attendance WHERE employee_id = ? AND date = ? AND action_type = "time-in"',
        [employeeData.employee_id, date]
      );

      if (existingTimeIn.length > 0) {
        console.log('⚠️ Employee already has time-in today');
        return res.status(400).json({
          success: false,
          message: `${employeeData.first_name} ${employeeData.last_name} already has a time-in record today at ${existingTimeIn[0].time}`
        });
      }
    }

    // Check if employee has time-in before time-out
    if (actionType === 'time-out') {
      const timeInToday = await query(
        'SELECT * FROM attendance WHERE employee_id = ? AND date = ? AND action_type = "time-in"',
        [employeeData.employee_id, date]
      );

      if (timeInToday.length === 0) {
        console.log('⚠️ No time-in record found for today');
        return res.status(400).json({
          success: false,
          message: `${employeeData.first_name} ${employeeData.last_name} has no time-in record today. Please time-in first.`
        });
      }

      // Check if already has time-out
      const existingTimeOut = await query(
        'SELECT * FROM attendance WHERE employee_id = ? AND date = ? AND action_type = "time-out"',
        [employeeData.employee_id, date]
      );

      if (existingTimeOut.length > 0) {
        console.log('⚠️ Employee already has time-out today');
        return res.status(400).json({
          success: false,
          message: `${employeeData.first_name} ${employeeData.last_name} already has a time-out record today at ${existingTimeOut[0].time}`
        });
      }
    }

    // Insert attendance record
    const result = await query(
      'INSERT INTO attendance (employee_id, qr_code, action_type, date, time, first_name, last_name, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        employeeData.employee_id,
        qrCode,
        actionType,
        date,
        time,
        employeeData.first_name,
        employeeData.last_name,
        employeeData.email
      ]
    );

    console.log('✅ ATTENDANCE RECORDED SUCCESSFULLY!');
    console.log(`📋 Record ID: ${result.insertId}`);
    console.log(`👤 Employee: ${employeeData.first_name} ${employeeData.last_name}`);
    console.log(`📅 Date: ${date}`);
    console.log(`⏰ Time: ${time}`);
    console.log(`🎯 Action: ${actionType.toUpperCase()}`);
    console.log('=== END ATTENDANCE RECORDING ===');

    return res.status(200).json({
      success: true,
      message: `${actionType === 'time-in' ? 'Time-in' : 'Time-out'} recorded successfully`,
      data: {
        attendanceId: result.insertId,
        userName: `${employeeData.first_name} ${employeeData.last_name}`,
        email: employeeData.email,
        actionType: actionType,
        date: date,
        time: time
      }
    });

  } catch (error) {
    console.error('❌ Attendance recording error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}

export default handler;