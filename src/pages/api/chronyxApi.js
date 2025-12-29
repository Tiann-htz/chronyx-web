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
  } else if (action === 'add-employee') {
    await handleAddEmployee(req, res);
  } else if (action === 'update-employee') {
    await handleUpdateEmployee(req, res);
  } else if (action === 'delete-employee') {
    await handleDeleteEmployee(req, res);
  } else if (action === 'restore-employee') {
    await handleRestoreEmployee(req, res);
  } else if (action === 'save-time-policy') {
    await handleSaveTimePolicy(req, res);
  } else if (action === 'generate-report') {
    await handleGenerateReport(req, res);
  } else if (action === 'get-employee-qr') {
    await handleGetEmployeeQR(req, res);
  } else if (action === 'deactivate-qr') {
    await handleDeactivateQR(req, res);
  } else if (action === 'activate-qr') {
    await handleActivateQR(req, res);
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
  } else if (getAction === 'get-time-policy') {
    await handleGetTimePolicy(req, res);
  } else if (getAction === 'get-dashboard-data') {
    await handleGetDashboardData(req, res);
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

// Get All Employees with QR Status
async function handleGetEmployees(req, res) {
  try {
    console.log('=== GET EMPLOYEES REQUEST ===');

    // Get employees with their QR status
    const employees = await query(`
      SELECT 
        e.*,
        eq.qr_id,
        eq.qr_code,
        eq.is_active as qr_is_active,
        eq.created_at as qr_created_at,
        eq.deactivated_at,
        eq.deactivated_by,
        eq.deactivation_reason,
        eq.last_scan_at
      FROM employee e
      LEFT JOIN employee_qr eq ON e.employee_id = eq.employee_id
      ORDER BY e.created_at DESC
    `);

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

// Get Recent Attendance 
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

// Get Time Policy
async function handleGetTimePolicy(req, res) {
  try {
    console.log('=== GET TIME POLICY REQUEST ===');

    const policies = await query('SELECT * FROM time_policy ORDER BY created_at DESC LIMIT 1');

    if (policies.length > 0) {
      console.log('Time policy found:', policies[0]);
      return res.status(200).json({
        success: true,
        data: policies[0]
      });
    } else {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No time policy configured'
      });
    }

  } catch (error) {
    console.error('Get time policy error:', error);
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

    // Get time policy for status calculation
const timePolicies = await query('SELECT * FROM time_policy ORDER BY created_at DESC LIMIT 1');
const timePolicy = timePolicies.length > 0 ? timePolicies[0] : null;

let status = 'on-time';
let lateMinutes = 0;
let overtimeMinutes = 0;
let undertimeMinutes = 0;

if (timePolicy && actionType === 'time-in') {
  // Calculate if late
  const [hours, minutes] = time.split(':').map(Number);
  const currentTimeInMinutes = hours * 60 + minutes;

  const [endHours, endMinutes] = timePolicy.time_in_end.split(':').map(Number);
  const cutoffTimeInMinutes = endHours * 60 + endMinutes + parseInt(timePolicy.grace_period);

  if (currentTimeInMinutes > cutoffTimeInMinutes) {
    status = 'late';
    lateMinutes = currentTimeInMinutes - cutoffTimeInMinutes;
    console.log(`⚠️ LATE: ${lateMinutes} minutes`);
  } else {
    console.log('✅ ON-TIME');
  }
} else if (timePolicy && actionType === 'time-out') {
  // Get time-in for this employee today
  const timeInRecords = await query(
    'SELECT time FROM attendance WHERE employee_id = ? AND date = ? AND action_type = "time-in"',
    [employeeData.employee_id, date]
  );

  if (timeInRecords.length > 0) {
    const timeIn = timeInRecords[0].time;
    const [inHours, inMinutes] = timeIn.split(':').map(Number);
    const [outHours, outMinutes] = time.split(':').map(Number);
    
    const timeInMinutes = inHours * 60 + inMinutes;
    const timeOutMinutes = outHours * 60 + outMinutes;
    const workedMinutes = timeOutMinutes - timeInMinutes;
    const workedHours = workedMinutes / 60;

    const requiredHours = parseFloat(timePolicy.required_hours);
    
    const [officialHours, officialMinutes] = timePolicy.official_time_out.split(':').map(Number);
    const officialTimeOutInMinutes = officialHours * 60 + officialMinutes;

    // Check conditions in order of priority
    if (workedHours < requiredHours) {
      // Didn't complete required hours
      status = 'undertime';
      undertimeMinutes = Math.round((requiredHours * 60) - workedMinutes);
      console.log(`⚠️ UNDERTIME: ${undertimeMinutes} minutes short`);
    } else if (timeOutMinutes > officialTimeOutInMinutes) {
      // Worked past official time out
      status = 'overtime';
      overtimeMinutes = timeOutMinutes - officialTimeOutInMinutes;
      console.log(`🔵 OVERTIME: ${overtimeMinutes} minutes extra`);
    } else {
      // Met required hours AND left on/before official time
      status = 'completed';
      console.log('✅ COMPLETED (Met required hours, left on time)');
    }
  }
}

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

    // Insert attendance record with status
const result = await query(
  'INSERT INTO attendance (employee_id, qr_code, action_type, date, time, first_name, last_name, email, status, late_minutes, overtime_minutes, undertime_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  [
    employeeData.employee_id,
    qrCode,
    actionType,
    date,
    time,
    employeeData.first_name,
    employeeData.last_name,
    employeeData.email,
    status,
    lateMinutes,
    overtimeMinutes,
    undertimeMinutes
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


// Add Employee
async function handleAddEmployee(req, res) {
  try {
    const { firstName, lastName, email, password, hourlyRate } = req.body;

    console.log('=== ADD EMPLOYEE REQUEST ===');
    console.log('Name:', firstName, lastName);
    console.log('Email:', email);

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required'
      });
    }

    // Validate hourly rate
    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid hourly rate is required'
      });
    }

    // Check if email already exists
    const existingEmployee = await query(
      'SELECT employee_id FROM employee WHERE email = ?',
      [email]
    );

    if (existingEmployee.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email already exists'
      });
    }

    // Insert new employee
    const result = await query(
      'INSERT INTO employee (first_name, last_name, email, password, hourly_rate, is_active) VALUES (?, ?, ?, ?, ?, 1)',
      [firstName, lastName, email, password, rate]
    );

    console.log('✅ EMPLOYEE REGISTERED SUCCESSFULLY!');
    console.log(`📋 Employee ID: ${result.insertId}`);
    console.log(`👤 Name: ${firstName} ${lastName}`);
    console.log(`📧 Email: ${email}`);
    console.log(`💰 Hourly Rate: ₱${rate}`);

    return res.status(200).json({
      success: true,
      message: 'Employee registered successfully',
      data: {
        employeeId: result.insertId,
        firstName: firstName,
        lastName: lastName,
        email: email,
        hourlyRate: rate
      }
    });

  } catch (error) {
    console.error('Add employee error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}

// Update Employee
async function handleUpdateEmployee(req, res) {
  try {
    const { employeeId, firstName, lastName, email, password, hourlyRate } = req.body;

    console.log('=== UPDATE EMPLOYEE REQUEST ===');
    console.log('Employee ID:', employeeId);

    // Validate input
    if (!employeeId || !firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, first name, last name, and email are required'
      });
    }

    // Check if email already exists for a different employee
    const existingEmail = await query(
      'SELECT employee_id FROM employee WHERE email = ? AND employee_id != ?',
      [email, employeeId]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists for another employee'
      });
    }

    // Build update query
    let updateQuery = 'UPDATE employee SET first_name = ?, last_name = ?, email = ?';
    let updateParams = [firstName, lastName, email];

    // Add hourly rate to update if provided
    if (hourlyRate !== undefined) {
      updateQuery += ', hourly_rate = ?';
      updateParams.push(parseFloat(hourlyRate));
    }

    // Add password to update if provided
    if (password && password.trim()) {
      updateQuery += ', password = ?';
      updateParams.push(password);
    }

    updateQuery += ' WHERE employee_id = ?';
    updateParams.push(employeeId);

    // Update employee
    await query(updateQuery, updateParams);

    // Also update related records in employee_qr and attendance tables
    await query(
      'UPDATE employee_qr SET first_name = ?, last_name = ?, email = ? WHERE employee_id = ?',
      [firstName, lastName, email, employeeId]
    );

    await query(
      'UPDATE attendance SET first_name = ?, last_name = ?, email = ? WHERE employee_id = ?',
      [firstName, lastName, email, employeeId]
    );

    console.log('✅ EMPLOYEE UPDATED SUCCESSFULLY!');

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully'
    });

  } catch (error) {
    console.error('Update employee error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}

// Delete Employee (Mark as Inactive)
async function handleDeleteEmployee(req, res) {
  try {
    const { employeeId } = req.body;

    console.log('=== DELETE EMPLOYEE REQUEST ===');
    console.log('Employee ID:', employeeId);

    // Validate input
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    // Mark employee as inactive
    await query(
      'UPDATE employee SET is_active = 0 WHERE employee_id = ?',
      [employeeId]
    );

    // Deactivate related QR codes
    await query(
      'UPDATE employee_qr SET is_active = 0 WHERE employee_id = ?',
      [employeeId]
    );

    console.log('✅ EMPLOYEE MARKED AS INACTIVE!');

    return res.status(200).json({
      success: true,
      message: 'Employee unregistered successfully'
    });

  } catch (error) {
    console.error('Delete employee error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}

// Restore Employee (Mark as Active)
async function handleRestoreEmployee(req, res) {
  try {
    const { employeeId } = req.body;

    console.log('=== RESTORE EMPLOYEE REQUEST ===');
    console.log('Employee ID:', employeeId);

    // Validate input
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    // Mark employee as active
    await query(
      'UPDATE employee SET is_active = 1 WHERE employee_id = ?',
      [employeeId]
    );

    // Reactivate related QR codes
    await query(
      'UPDATE employee_qr SET is_active = 1, deactivated_at = NULL, deactivated_by = NULL, deactivation_reason = NULL WHERE employee_id = ?',
      [employeeId]
    );

    console.log('✅ EMPLOYEE RESTORED TO ACTIVE!');

    return res.status(200).json({
      success: true,
      message: 'Employee registered back successfully'
    });

  } catch (error) {
    console.error('Restore employee error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}

// Save Time Policy
async function handleSaveTimePolicy(req, res) {
  try {
    const { timeInStart, timeInEnd, gracePeriod, officialTimeOut, requiredHours } = req.body;

    console.log('=== SAVE TIME POLICY REQUEST ===');
    console.log('Time In:', timeInStart, '-', timeInEnd);
    console.log('Grace Period:', gracePeriod);
    console.log('Time Out:', officialTimeOut);
    console.log('Required Hours:', requiredHours);

    // Validate input
    if (!timeInStart || !timeInEnd || !officialTimeOut || !requiredHours) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if policy exists
    const existingPolicies = await query('SELECT * FROM time_policy LIMIT 1');

    let result;
    if (existingPolicies.length > 0) {
      // Update existing policy
      result = await query(
        `UPDATE time_policy SET 
         time_in_start = ?, 
         time_in_end = ?, 
         grace_period = ?, 
         official_time_out = ?, 
         required_hours = ?
         WHERE policy_id = ?`,
        [timeInStart, timeInEnd, gracePeriod, officialTimeOut, requiredHours, existingPolicies[0].policy_id]
      );
      console.log('✅ TIME POLICY UPDATED!');
    } else {
      // Create new policy
      result = await query(
        `INSERT INTO time_policy (time_in_start, time_in_end, grace_period, official_time_out, required_hours) 
         VALUES (?, ?, ?, ?, ?)`,
        [timeInStart, timeInEnd, gracePeriod, officialTimeOut, requiredHours]
      );
      console.log('✅ TIME POLICY CREATED!');
    }

    // Fetch the updated/created policy
    const savedPolicy = await query('SELECT * FROM time_policy ORDER BY created_at DESC LIMIT 1');

    return res.status(200).json({
      success: true,
      message: existingPolicies.length > 0 ? 'Time policy updated successfully' : 'Time policy created successfully',
      data: savedPolicy[0]
    });

  } catch (error) {
    console.error('Save time policy error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}


// Generate Attendance Report
async function handleGenerateReport(req, res) {
  try {
    const { dateFrom, dateTo, employeeId } = req.body;

    console.log('=== GENERATE REPORT REQUEST ===');
    console.log('Date From:', dateFrom);
    console.log('Date To:', dateTo);
    console.log('Employee ID:', employeeId || 'All');

    // Validate input
    if (!dateFrom || !dateTo) {
      return res.status(400).json({
        success: false,
        message: 'Date range is required'
      });
    }

    // Get all employees or specific employee
    let employees;
    if (employeeId) {
      employees = await query('SELECT * FROM employee WHERE employee_id = ? AND is_active = 1', [employeeId]);
    } else {
      employees = await query('SELECT * FROM employee WHERE is_active = 1');
    }

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No employees found'
      });
    }

    // Calculate total days in range
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const reportData = [];
    let totalOnTime = 0;
    let totalLate = 0;
    let totalAbsent = 0;

    for (const employee of employees) {
      // Get all attendance records for this employee in the date range
      const attendanceRecords = await query(
        `SELECT * FROM attendance 
         WHERE employee_id = ? 
         AND date BETWEEN ? AND ?
         ORDER BY date, time`,
        [employee.employee_id, dateFrom, dateTo]
      );

      // Count unique days worked
      const daysWorked = new Set(attendanceRecords.map(r => r.date)).size;
      const absentCount = totalDays - daysWorked;

      // Count statuses
      const onTimeCount = attendanceRecords.filter(r => r.action_type === 'time-in' && r.status === 'on-time').length;
      const lateCount = attendanceRecords.filter(r => r.action_type === 'time-in' && r.status === 'late').length;

      // Calculate total late minutes
      const totalLateMinutes = attendanceRecords
        .filter(r => r.status === 'late')
        .reduce((sum, r) => sum + (r.late_minutes || 0), 0);

      // Calculate total overtime minutes
      const totalOvertimeMinutes = attendanceRecords
        .filter(r => r.status === 'overtime')
        .reduce((sum, r) => sum + (r.overtime_minutes || 0), 0);

      // Calculate attendance rate
      const attendanceRate = totalDays > 0 ? Math.round((daysWorked / totalDays) * 100) : 0;

      reportData.push({
        employee_id: employee.employee_id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        avatar_url: employee.avatar_url,
        days_worked: daysWorked,
        on_time_count: onTimeCount,
        late_count: lateCount,
        absent_count: absentCount,
        total_late_minutes: totalLateMinutes,
        total_overtime_minutes: totalOvertimeMinutes,
        attendance_rate: attendanceRate
      });

      totalOnTime += onTimeCount;
      totalLate += lateCount;
      totalAbsent += absentCount;
    }

    // Calculate summary statistics
    const totalRecords = totalOnTime + totalLate;
    const summary = {
      totalDays: totalDays,
      totalEmployees: employees.length,
      totalOnTime: totalOnTime,
      totalLate: totalLate,
      totalAbsent: totalAbsent,
      onTimeRate: totalRecords > 0 ? Math.round((totalOnTime / totalRecords) * 100) : 0,
      lateRate: totalRecords > 0 ? Math.round((totalLate / totalRecords) * 100) : 0,
      absentRate: totalRecords > 0 ? Math.round((totalAbsent / (totalDays * employees.length)) * 100) : 0
    };

    console.log('✅ REPORT GENERATED SUCCESSFULLY!');
    console.log(`📊 Total Employees: ${employees.length}`);
    console.log(`📅 Date Range: ${dateFrom} to ${dateTo}`);

    return res.status(200).json({
      success: true,
      data: reportData,
      summary: summary
    });

  } catch (error) {
    console.error('Generate report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}


// Get Employee QR Details
async function handleGetEmployeeQR(req, res) {
  try {
    const { employeeId } = req.body;

    console.log('=== GET EMPLOYEE QR REQUEST ===');
    console.log('Employee ID:', employeeId);

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    // Get employee info with QR data
    const result = await query(`
      SELECT 
        e.employee_id,
        e.first_name,
        e.last_name,
        e.email,
        e.avatar_url,
        eq.qr_id,
        eq.qr_code,
        eq.is_active,
        eq.created_at as qr_created_at,
        eq.deactivated_at,
        eq.deactivated_by,
        eq.deactivation_reason,
        eq.last_scan_at,
        a.admin_name as deactivated_by_name
      FROM employee e
      LEFT JOIN employee_qr eq ON e.employee_id = eq.employee_id
      LEFT JOIN admin a ON eq.deactivated_by = a.admin_id
      WHERE e.employee_id = ?
    `, [employeeId]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    console.log('✅ QR DATA RETRIEVED');
    
    return res.status(200).json({
      success: true,
      data: result[0]
    });

  } catch (error) {
    console.error('Get employee QR error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}

// Deactivate QR Code
async function handleDeactivateQR(req, res) {
  try {
    const { employeeId, adminId, reason } = req.body;

    console.log('=== DEACTIVATE QR REQUEST ===');
    console.log('Employee ID:', employeeId);
    console.log('Admin ID:', adminId);
    console.log('Reason:', reason);

    if (!employeeId || !adminId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID and Admin ID are required'
      });
    }

    // Check if QR exists
    const qrCheck = await query(
      'SELECT qr_id FROM employee_qr WHERE employee_id = ?',
      [employeeId]
    );

    if (qrCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No QR code found for this employee'
      });
    }

    // Deactivate the QR
    await query(
      `UPDATE employee_qr 
       SET is_active = 0, 
           deactivated_at = NOW(), 
           deactivated_by = ?, 
           deactivation_reason = ?
       WHERE employee_id = ?`,
      [adminId, reason, employeeId]
    );

    console.log('✅ QR CODE DEACTIVATED');

    return res.status(200).json({
      success: true,
      message: 'QR code deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate QR error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}

// Activate QR Code
async function handleActivateQR(req, res) {
  try {
    const { employeeId } = req.body;

    console.log('=== ACTIVATE QR REQUEST ===');
    console.log('Employee ID:', employeeId);

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    // Check if QR exists
    const qrCheck = await query(
      'SELECT qr_id FROM employee_qr WHERE employee_id = ?',
      [employeeId]
    );

    if (qrCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No QR code found for this employee'
      });
    }

    // Activate the QR (clear deactivation fields)
    await query(
      `UPDATE employee_qr 
       SET is_active = 1, 
           deactivated_at = NULL, 
           deactivated_by = NULL, 
           deactivation_reason = NULL
       WHERE employee_id = ?`,
      [employeeId]
    );

    console.log('✅ QR CODE ACTIVATED');

    return res.status(200).json({
      success: true,
      message: 'QR code activated successfully'
    });

  } catch (error) {
    console.error('Activate QR error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}


// Get Dashboard Data
async function handleGetDashboardData(req, res) {
  try {
    console.log('=== GET DASHBOARD DATA REQUEST ===');

    // Get current date in Philippine timezone
    const phNow = new Date();
    const phOffset = 8 * 60; // UTC+8 in minutes
    const utcTime = phNow.getTime() + (phNow.getTimezoneOffset() * 60000);
    const phDate = new Date(utcTime + (phOffset * 60000));
    const todayStr = phDate.toISOString().split('T')[0];
    
    // Check if custom date range is provided
    const customDateFrom = req.headers['date-from'];
    const customDateTo = req.headers['date-to'];
    
    let sevenDaysAgoDate, today;
    
    if (customDateFrom && customDateTo) {
      // Use custom date range
      sevenDaysAgoDate = customDateFrom;
      today = customDateTo;
      console.log('Using custom date range:', sevenDaysAgoDate, 'to', today);
    } else {
      // Use default 7-day range
      const sevenDaysAgo = new Date(phDate);
      sevenDaysAgo.setDate(phDate.getDate() - 6);
      sevenDaysAgoDate = sevenDaysAgo.toISOString().split('T')[0];
      today = todayStr;
      console.log('Using default 7-day range:', sevenDaysAgoDate, 'to', today);
    }

    // Get total active employees
    const totalEmployeesResult = await query(
      'SELECT COUNT(*) as total FROM employee WHERE is_active = 1'
    );
    const totalEmployees = totalEmployeesResult[0].total;

    // Get today's attendance
    const todayAttendance = await query(
      `SELECT * FROM attendance WHERE date = ?`,
      [todayStr]
    );

    // Calculate today's stats
    const uniqueEmployeesToday = [...new Set(todayAttendance.map(a => a.employee_id))];
    const presentToday = uniqueEmployeesToday.length;
    const lateToday = todayAttendance.filter(a => a.action_type === 'time-in' && a.status === 'late').length;
    const onTimeToday = todayAttendance.filter(a => a.action_type === 'time-in' && a.status === 'on-time').length;
    const totalTimeIns = todayAttendance.filter(a => a.action_type === 'time-in').length;
    const onTimeRate = totalTimeIns > 0 ? Math.round((onTimeToday / totalTimeIns) * 100) : 0;

    // Get last 7 days data (including today)
const lastSevenDaysData = await query(
  `SELECT 
    DATE_FORMAT(date, '%Y-%m-%d') as date,
    employee_id,
    action_type,
    status
  FROM attendance 
  WHERE date BETWEEN ? AND ?
  ORDER BY date ASC`,
  [sevenDaysAgoDate, today]
);

console.log('Sample attendance record:', lastSevenDaysData[0]);

    console.log('Last 7 days raw data:', lastSevenDaysData.length, 'records');
    console.log('Date range:', sevenDaysAgoDate, 'to', today);

    // Process date range data (dynamic days)
    const startDate = new Date(sevenDaysAgoDate);
    const endDate = new Date(today);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    console.log('Processing', daysDiff, 'days from', sevenDaysAgoDate, 'to', today);
    
    const sevenDaysSummary = [];
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      const dayRecords = lastSevenDaysData.filter(r => r.date === dateStr);
      const uniqueEmployees = [...new Set(dayRecords.map(r => r.employee_id))];
      const present = uniqueEmployees.length;
      const late = dayRecords.filter(r => r.action_type === 'time-in' && r.status === 'late').length;
      const absent = totalEmployees - present;

      sevenDaysSummary.push({
        date: dateStr,
        day: dayName,
        present,
        late,
        absent
      });
      
      console.log(`${dayName} (${dateStr}): ${present} present, ${late} late, ${absent} absent`);
    }

    // Get monthly data (broken down by weeks)
const selectedMonth = req.headers['selected-month'];
const selectedYear = req.headers['selected-year'];

let monthlyData = [];
let monthStart, monthEnd;

if (selectedMonth && selectedYear) {
  // Use selected month/year
  const month = parseInt(selectedMonth);
  const year = parseInt(selectedYear);
  monthStart = new Date(year, month - 1, 1);
  monthEnd = new Date(year, month, 0); // Last day of month
} else {
  // Default to current month
  monthStart = new Date(phDate.getFullYear(), phDate.getMonth(), 1);
  monthEnd = new Date(phDate.getFullYear(), phDate.getMonth() + 1, 0);
}

const monthStartStr = monthStart.toISOString().split('T')[0];
const monthEndStr = monthEnd.toISOString().split('T')[0];

console.log('Monthly range:', monthStartStr, 'to', monthEndStr);

// Get all attendance for the month
const monthlyAttendance = await query(
  `SELECT 
    DATE_FORMAT(date, '%Y-%m-%d') as date,
    employee_id,
    action_type,
    status
  FROM attendance 
  WHERE date BETWEEN ? AND ?
  ORDER BY date ASC`,
  [monthStartStr, monthEndStr]
);

console.log('Monthly raw data:', monthlyAttendance.length, 'records');

// Calculate weeks in the month
const weeksInMonth = [];
let currentWeekStart = new Date(monthStart);

while (currentWeekStart <= monthEnd) {
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(currentWeekStart.getDate() + 6);
  
  // Don't go beyond month end
  const actualWeekEnd = weekEnd > monthEnd ? monthEnd : weekEnd;
  
  weeksInMonth.push({
    start: new Date(currentWeekStart),
    end: actualWeekEnd
  });
  
  currentWeekStart = new Date(weekEnd);
  currentWeekStart.setDate(weekEnd.getDate() + 1);
}

console.log('Weeks in month:', weeksInMonth.length);

// Process each week
weeksInMonth.forEach((week, index) => {
  const weekStartStr = week.start.toISOString().split('T')[0];
  const weekEndStr = week.end.toISOString().split('T')[0];
  
  const weekRecords = monthlyAttendance.filter(r => {
    return r.date >= weekStartStr && r.date <= weekEndStr;
  });
  
  const uniqueEmployees = [...new Set(weekRecords.map(r => r.employee_id))];
  const present = uniqueEmployees.length;
  const late = weekRecords.filter(r => r.action_type === 'time-in' && r.status === 'late').length;
  const absent = totalEmployees - present;
  
  monthlyData.push({
    week: `Week ${index + 1}`,
    present,
    late,
    absent,
    dateRange: `${week.start.getDate()}-${week.end.getDate()}`
  });
  
  console.log(`Week ${index + 1} (${weekStartStr} to ${weekEndStr}): ${present} present, ${late} late, ${absent} absent`);
});

    // Get recent activity (all today's records)
    const recentActivity = await query(
      `SELECT 
        a.*,
        e.avatar_url
      FROM attendance a
      LEFT JOIN employee e ON a.employee_id = e.employee_id
      WHERE a.date = ?
      ORDER BY a.time DESC`,
      [todayStr]
    );

    console.log('✅ DASHBOARD DATA LOADED');
    console.log(`Today: ${presentToday} present, ${lateToday} late, ${onTimeRate}% on-time`);

    return res.status(200).json({
  success: true,
  data: {
    today: {
      present: presentToday,
      late: lateToday,
      onTimeRate: onTimeRate,
      totalEmployees: totalEmployees
    },
    lastSevenDays: sevenDaysSummary,
    monthlyWeeks: monthlyData,
    recentActivity: recentActivity
  }
});

  } catch (error) {
    console.error('Get dashboard data error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}

export default handler;