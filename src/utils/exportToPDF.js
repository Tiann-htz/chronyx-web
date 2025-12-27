import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = (reportData, summary, dateFrom, dateTo) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  
  // Add title
  doc.setFontSize(18);
  doc.setTextColor(10, 126, 177);
  doc.text('ATTENDANCE REPORT', 14, 20);
  
  // Add report period
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report Period: ${formatDate(dateFrom)} - ${formatDate(dateTo)}`, 14, 28);
  doc.text(`Generated: ${new Date().toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 14, 34);
  
  // Add summary section
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Summary Statistics', 14, 44);
  
  autoTable(doc, {
    startY: 48,
    head: [['Metric', 'Count', 'Percentage']],
    body: [
      ['Total Days', summary.totalDays, '-'],
      ['Total Employees', summary.totalEmployees, '-'],
      ['On-Time Records', summary.totalOnTime, `${summary.onTimeRate}%`],
      ['Late Records', summary.totalLate, `${summary.lateRate}%`],
      ['Absent Records', summary.totalAbsent, `${summary.absentRate}%`]
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [10, 126, 177],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: { 
      fontSize: 9 
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 40, halign: 'center' }
    }
  });
  
  // Add employee details section
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text('Employee Details', 14, finalY);
  
  // Prepare employee data
  const employeeData = reportData.map(emp => [
    `${emp.first_name} ${emp.last_name}`,
    emp.email,
    emp.days_worked,
    emp.on_time_count,
    emp.late_count,
    emp.absent_count,
    formatMinutesToHours(emp.total_late_minutes),
    formatMinutesToHours(emp.total_overtime_minutes),
    `${emp.attendance_rate}%`
  ]);
  
  autoTable(doc, {
    startY: finalY + 4,
    head: [[
      'Employee',
      'Email',
      'Days',
      'On-Time',
      'Late',
      'Absent',
      'Late Time',
      'OT Time',
      'Rate'
    ]],
    body: employeeData,
    theme: 'striped',
    headStyles: { 
      fillColor: [10, 126, 177],
      fontSize: 8,
      fontStyle: 'bold'
    },
    bodyStyles: { 
      fontSize: 7
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 50 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 20, halign: 'center' },
      7: { cellWidth: 20, halign: 'center' },
      8: { cellWidth: 18, halign: 'center' }
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      '© 2025 Chronyx. All rights reserved.',
      14,
      doc.internal.pageSize.height - 10
    );
  }
  
  // Generate file name and save
  const fileName = `Attendance_Report_${dateFrom}_to_${dateTo}.pdf`;
  doc.save(fileName);
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