import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Attendance, Student, Course } from '@/types'
import { formatDateTime } from '@/lib/utils'

interface AttendanceWithStudent extends Attendance {
  student: Student
}

interface PDFData {
  course: Course
  attendanceDate: string
  teacherName: string
  records: AttendanceWithStudent[]
}

export function generateAttendancePDF(data: PDFData): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  
  let yPosition = 20

  // Header - Institution Name
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Academic Portal', pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 10
  doc.setFontSize(14)
  doc.text('Attendance Report', pageWidth / 2, yPosition, { align: 'center' })
  
  // Course Information
  yPosition += 15
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  
  const courseInfo = [
    `Course: ${data.course.courseName}`,
    `Course Code: ${data.course.courseCode}`,
    `Date: ${new Date(data.attendanceDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`,
    `Teacher: ${data.teacherName}`
  ]
  
  courseInfo.forEach(info => {
    doc.text(info, 14, yPosition)
    yPosition += 7
  })

  // Table Data
  yPosition += 5
  const tableData = data.records.map(record => [
    record.student.studentId,
    `${record.student.firstName} ${record.student.lastName}`,
    record.student.className,
    record.status
  ])

  autoTable(doc, {
    startY: yPosition,
    head: [['Student ID', 'Student Name', 'Class', 'Attendance Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'left'
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 60 },
      2: { cellWidth: 40 },
      3: { cellWidth: 45 }
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    didDrawPage: (data) => {
      // Footer on each page
      const footerY = pageHeight - 15
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100)
      
      // Generated timestamp
      const generatedText = `Generated on: ${formatDateTime(new Date())}`
      doc.text(generatedText, 14, footerY)
      
      // Page number
      const pageText = `Page ${doc.getCurrentPageInfo().pageNumber}`
      doc.text(pageText, pageWidth - 14, footerY, { align: 'right' })
    }
  })

  // Save the PDF
  const fileName = `Attendance_${data.course.courseCode}_${data.attendanceDate}.pdf`
  doc.save(fileName)
}
