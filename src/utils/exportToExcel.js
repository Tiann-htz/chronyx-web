import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToExcel = (reportData, summary, dateFrom, dateTo) => {
  // Prepare data for Excel
  const excelData = reportData.map(emp => ({
    'Employee Name': `${emp.first_name} ${emp.last_name}`,
    'Email': emp.email,
    'Days Worked': emp.days_worked,
    'On-Time': emp.on_time_count,
    'Late': emp.late_count,
    'Absent': emp.absent_count,
    'Total Late Time': formatMinutesToHours(emp.total_late_minutes),
    'Total Overtime': formatMinutesToHours(emp.total_overtime_minutes),
    'Attendance Rate': `${emp.attendance_rate}%`
  }));

  // Create summary data
  const summaryData = [
    ['ATTENDANCE REPORT SUMMARY'],
    [''],
    ['Report Period:', `${formatDate(dateFrom)} - ${formatDate(dateTo)}`],
    ['Total Days:', summary.totalDays],
    ['Total Employees:', summary.totalEmployees],
    [''],
    ['STATISTICS'],
    ['Total On-Time:', summary.totalOnTime, `${summary.onTimeRate}%`],
    ['Total Late:', summary.totalLate, `${summary.lateRate}%`],
    ['Total Absent:', summary.totalAbsent, `${summary.absentRate}%`],
    [''],
    ['DETAILED EMPLOYEE RECORDS']
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Add summary sheet
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  // Add detailed data sheet
  const dataWs = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths
  const colWidths = [
    { wch: 25 }, // Employee Name
    { wch: 30 }, // Email
    { wch: 12 }, // Days Worked
    { wch: 10 }, // On-Time
    { wch: 10 }, // Late
    { wch: 10 }, // Absent
    { wch: 15 }, // Total Late Time
    { wch: 15 }, // Total Overtime
    { wch: 15 }  // Attendance Rate
  ];
  dataWs['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, dataWs, 'Employee Details');

  // Generate file name
  const fileName = `Attendance_Report_${dateFrom}_to_${dateTo}.xlsx`;

  // Write and save file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  saveAs(blob, fileName);
};

// Helper functions
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const formatMinutesToHours = (minutes) => {
  if (!minutes || minutes === 0) return '0m';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};