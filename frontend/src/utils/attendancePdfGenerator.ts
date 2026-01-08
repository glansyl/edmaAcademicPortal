import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Student, Course } from '@/types'

interface AttendanceRecord {
  studentId: string
  studentName: string
  className: string
  status: string
}

interface PdfOptions {
  course: Course
  attendanceDate: string
  teacherName: string
  records: AttendanceRecord[]
}

export function generateAttendancePdf(options: PdfOptions): void {
  const { course, attendanceDate, teacherName, records } = options
  
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  
  let yPosition = 20

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Academic Portal', pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 10
  doc.setFontSize(14)
  doc.text('Attendance Report', pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 15
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  doc.text(`Course: ${course.courseName}`, 14, yPosition)
  yPosition += 6
  doc.text(`Course Code: ${course.courseCode}`, 14, yPosition)
  yPosition += 6
  doc.text(`Date: ${new Date(attendanceDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 14, yPosition)
  yPosition += 6
  doc.text(`Teacher: ${teacherName}`, 14, yPosition)
  
  yPosition += 10

  const tableData = records.map(record => [
    record.studentId,
    record.studentName,
    record.className,
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
      fontSize: 9,
      cellPadding: 4,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 60 },
      2: { cellWidth: 40 },
      3: { cellWidth: 50 }
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    didDrawPage: (data) => {
      const footerY = pageHeight - 15
      doc.setFontSize(8)
      doc.setTextColor(128)
      doc.text(
        `Generated on: ${new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        14,
        footerY
      )
      
      const pageCount = (doc as any).internal.getNumberOfPages()
      const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber
      doc.text(
        `Page ${currentPage} of ${pageCount}`,
        pageWidth - 14,
        footerY,
        { align: 'right' }
      )
    }
  })

  const fileName = `Attendance_${course.courseCode}_${attendanceDate}.pdf`
  doc.save(fileName)
}

export function generateAttendancePdfFromStudents(
  students: Student[],
  attendanceRecords: Map<number, string>,
  course: Course,
  attendanceDate: string,
  teacherName: string
): void {
  const records: AttendanceRecord[] = students.map(student => ({
    studentId: student.studentId,
    studentName: `${student.firstName} ${student.lastName}`,
    className: student.className,
    status: attendanceRecords.get(student.id) || 'PRESENT'
  }))

  generateAttendancePdf({
    course,
    attendanceDate,
    teacherName,
    records
  })
}
