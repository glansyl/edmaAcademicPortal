/**
 * Professional Report Card PDF Generator
 * Creates academic-quality PDF report cards using jsPDF and jspdf-autotable
 */

import * as jsPDF from 'jspdf'
import 'jspdf-autotable'
import { ReportCardData, ReportCardSubject, ReportCardAssessment } from '@/services/reportCardService'
import { formatPercentage, formatGPA } from './gradeCalculations'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: { finalY: number }
  }
}

interface PdfStyles {
  colors: {
    primary: [number, number, number]
    secondary: [number, number, number]
    text: [number, number, number]
    lightGray: [number, number, number]
    border: [number, number, number]
  }
  fonts: {
    title: number
    heading: number
    subheading: number
    body: number
    small: number
  }
  spacing: {
    section: number
    line: number
    margin: number
  }
}

const PDF_STYLES: PdfStyles = {
  colors: {
    primary: [37, 99, 235],      // Blue-600
    secondary: [75, 85, 99],     // Gray-600
    text: [17, 24, 39],          // Gray-900
    lightGray: [243, 244, 246],  // Gray-100
    border: [209, 213, 219]      // Gray-300
  },
  fonts: {
    title: 18,
    heading: 14,
    subheading: 12,
    body: 10,
    small: 8
  },
  spacing: {
    section: 15,
    line: 6,
    margin: 20
  }
}

export class ReportCardPdfGenerator {
  private doc: jsPDF.jsPDF
  private pageWidth: number
  private pageHeight: number
  private currentY: number
  private styles: PdfStyles

  constructor() {
    this.doc = new jsPDF.jsPDF()
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.currentY = PDF_STYLES.spacing.margin
    this.styles = PDF_STYLES
  }

  /**
   * Generate complete report card PDF
   */
  public generateReportCard(data: ReportCardData): void {
    try {
      // Reset position
      this.currentY = this.styles.spacing.margin

      // Generate PDF sections
      this.addHeader(data)
      this.addStudentDetails(data)
      this.addAcademicPerformanceTable(data)
      this.addSummarySection(data)
      this.addFooter(data)

      // Save the PDF
      const fileName = this.generateFileName(data)
      this.doc.save(fileName)

    } catch (error) {
      console.error('Failed to generate PDF:', error)
      throw new Error('Failed to generate report card PDF. Please try again.')
    }
  }

  /**
   * Add PDF header with institution name and title
   */
  private addHeader(data: ReportCardData): void {
    const centerX = this.pageWidth / 2

    // Institution name
    this.doc.setFontSize(this.styles.fonts.title)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(...this.styles.colors.primary)
    this.doc.text('Academic Portal', centerX, this.currentY, { align: 'center' })

    this.currentY += this.styles.spacing.line + 2

    // Document title
    this.doc.setFontSize(this.styles.fonts.heading)
    this.doc.setTextColor(...this.styles.colors.text)
    this.doc.text('Student Report Card', centerX, this.currentY, { align: 'center' })

    this.currentY += this.styles.spacing.line

    // Academic period
    this.doc.setFontSize(this.styles.fonts.body)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(...this.styles.colors.secondary)
    const academicPeriod = `${data.academicInfo.semester} Semester ${data.academicInfo.academicYear}`
    this.doc.text(academicPeriod, centerX, this.currentY, { align: 'center' })

    this.currentY += this.styles.spacing.section
  }

  /**
   * Add student details section
   */
  private addStudentDetails(data: ReportCardData): void {
    const leftMargin = this.styles.spacing.margin
    const centerX = this.pageWidth / 2

    // Section title
    this.doc.setFontSize(this.styles.fonts.subheading)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(...this.styles.colors.text)
    this.doc.text('Student Information', leftMargin, this.currentY)

    this.currentY += this.styles.spacing.line + 2

    // Student details in two columns
    this.doc.setFontSize(this.styles.fonts.body)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(...this.styles.colors.text)

    const detailsY = this.currentY

    // Left column
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Student Name:', leftMargin, detailsY)
    this.doc.text('Student ID:', leftMargin, detailsY + this.styles.spacing.line)
    this.doc.text('Class:', leftMargin, detailsY + (this.styles.spacing.line * 2))

    this.doc.setFont('helvetica', 'normal')
    this.doc.text(data.student.name, leftMargin + 35, detailsY)
    this.doc.text(data.student.studentId, leftMargin + 35, detailsY + this.styles.spacing.line)
    this.doc.text(data.student.className, leftMargin + 35, detailsY + (this.styles.spacing.line * 2))

    // Right column
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Department:', centerX, detailsY)
    this.doc.text('Generated:', centerX, detailsY + this.styles.spacing.line)

    this.doc.setFont('helvetica', 'normal')
    this.doc.text(data.student.department, centerX + 30, detailsY)
    this.doc.text(data.academicInfo.generatedDate, centerX + 30, detailsY + this.styles.spacing.line)

    this.currentY = detailsY + (this.styles.spacing.line * 3) + this.styles.spacing.section
  }

  /**
   * Add academic performance table
   */
  private addAcademicPerformanceTable(data: ReportCardData): void {
    // Section title
    this.doc.setFontSize(this.styles.fonts.subheading)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(...this.styles.colors.text)
    this.doc.text('Academic Performance', this.styles.spacing.margin, this.currentY)

    this.currentY += this.styles.spacing.line + 5

    // Prepare table data
    const tableData = this.prepareTableData(data.subjects)

    // Generate table
    this.doc.autoTable({
      startY: this.currentY,
      head: [['Subject Code', 'Subject Name', 'Assessments', 'Total Marks', 'Percentage', 'Grade']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: this.styles.colors.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: this.styles.fonts.body,
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        fontSize: this.styles.fonts.body,
        textColor: this.styles.colors.text,
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },  // Subject Code
        1: { cellWidth: 50, halign: 'left' },    // Subject Name
        2: { cellWidth: 45, halign: 'left' },    // Assessments
        3: { cellWidth: 25, halign: 'center' },  // Total Marks
        4: { cellWidth: 25, halign: 'center' },  // Percentage
        5: { cellWidth: 20, halign: 'center' }   // Grade
      },
      alternateRowStyles: {
        fillColor: this.styles.colors.lightGray
      },
      styles: {
        lineColor: this.styles.colors.border,
        lineWidth: 0.1
      },
      didDrawPage: (data: any) => {
        this.addPageFooter(data.pageNumber)
      }
    })

    // Update current Y position
    this.currentY = this.doc.lastAutoTable.finalY + this.styles.spacing.section
  }

  /**
   * Prepare table data from subjects
   */
  private prepareTableData(subjects: ReportCardSubject[]): string[][] {
    return subjects.map(subject => {
      // Format assessments
      const assessmentText = this.formatAssessments(subject.assessments)
      
      // Format marks
      const marksText = `${subject.totalMarksObtained}/${subject.totalMaxMarks}`
      
      // Format percentage
      const percentageText = formatPercentage(subject.overallPercentage)

      return [
        subject.courseCode,
        subject.courseName,
        assessmentText,
        marksText,
        percentageText,
        subject.overallGrade
      ]
    })
  }

  /**
   * Format assessments for display in table
   */
  private formatAssessments(assessments: ReportCardAssessment[]): string {
    const assessmentSummary = assessments.map(assessment => {
      const percentage = formatPercentage(assessment.percentage, 0)
      return `${assessment.examType}: ${percentage}`
    })
    
    return assessmentSummary.join('\n')
  }

  /**
   * Add summary section
   */
  private addSummarySection(data: ReportCardData): void {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 80) {
      this.doc.addPage()
      this.currentY = this.styles.spacing.margin
    }

    const leftMargin = this.styles.spacing.margin
    const centerX = this.pageWidth / 2

    // Section title
    this.doc.setFontSize(this.styles.fonts.subheading)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(...this.styles.colors.text)
    this.doc.text('Academic Summary', leftMargin, this.currentY)

    this.currentY += this.styles.spacing.line + 5

    // Summary box
    const boxY = this.currentY
    const boxHeight = 40
    const boxWidth = this.pageWidth - (this.styles.spacing.margin * 2)

    // Draw summary box
    this.doc.setDrawColor(...this.styles.colors.border)
    this.doc.setFillColor(...this.styles.colors.lightGray)
    this.doc.rect(leftMargin, boxY, boxWidth, boxHeight, 'FD')

    // Summary content
    this.doc.setFontSize(this.styles.fonts.body)
    this.doc.setTextColor(...this.styles.colors.text)

    const summaryY = boxY + 8
    const col1X = leftMargin + 10
    const col2X = centerX + 10

    // Left column
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Total Subjects:', col1X, summaryY)
    this.doc.text('Average Percentage:', col1X, summaryY + this.styles.spacing.line)
    this.doc.text('Overall Grade:', col1X, summaryY + (this.styles.spacing.line * 2))

    this.doc.setFont('helvetica', 'normal')
    this.doc.text(data.summary.totalSubjects.toString(), col1X + 45, summaryY)
    this.doc.text(formatPercentage(data.summary.averagePercentage), col1X + 45, summaryY + this.styles.spacing.line)
    this.doc.text(data.summary.overallGrade, col1X + 45, summaryY + (this.styles.spacing.line * 2))

    // Right column (if data available)
    if (data.summary.gpa !== null || data.summary.totalCredits !== null) {
      this.doc.setFont('helvetica', 'bold')
      
      if (data.summary.gpa !== null) {
        this.doc.text('GPA:', col2X, summaryY)
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(formatGPA(data.summary.gpa), col2X + 25, summaryY)
      }
      
      if (data.summary.totalCredits !== null) {
        this.doc.setFont('helvetica', 'bold')
        this.doc.text('Total Credits:', col2X, summaryY + this.styles.spacing.line)
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(data.summary.totalCredits.toString(), col2X + 35, summaryY + this.styles.spacing.line)
      }
    }

    this.currentY = boxY + boxHeight + this.styles.spacing.section
  }

  /**
   * Add footer to each page
   */
  private addPageFooter(pageNumber: number): void {
    const footerY = this.pageHeight - 15
    
    this.doc.setFontSize(this.styles.fonts.small)
    this.doc.setTextColor(...this.styles.colors.secondary)
    
    // Left side - Generated by
    this.doc.text('Generated by Academic Portal', this.styles.spacing.margin, footerY)
    
    // Right side - Page number
    const totalPages = this.doc.getNumberOfPages()
    this.doc.text(
      `Page ${pageNumber} of ${totalPages}`,
      this.pageWidth - this.styles.spacing.margin,
      footerY,
      { align: 'right' }
    )
  }

  /**
   * Add final footer with timestamp
   */
  private addFooter(data: ReportCardData): void {
    // Check if we need space for footer
    if (this.currentY > this.pageHeight - 40) {
      this.doc.addPage()
      this.currentY = this.styles.spacing.margin
    }

    const footerY = this.pageHeight - 25
    
    this.doc.setFontSize(this.styles.fonts.small)
    this.doc.setTextColor(...this.styles.colors.secondary)
    
    // Timestamp
    const timestamp = `Generated on ${data.academicInfo.generatedDate} at ${data.academicInfo.generatedTime}`
    this.doc.text(timestamp, this.pageWidth / 2, footerY, { align: 'center' })
    
    // Disclaimer
    this.doc.text(
      'This is an official academic document generated by the Academic Portal system.',
      this.pageWidth / 2,
      footerY + this.styles.spacing.line,
      { align: 'center' }
    )
  }

  /**
   * Generate appropriate filename
   */
  private generateFileName(data: ReportCardData): string {
    const studentId = data.student.studentId.replace(/[^a-zA-Z0-9]/g, '')
    const semester = data.academicInfo.semester.replace(/\s+/g, '')
    const year = data.academicInfo.academicYear.replace(/[^0-9-]/g, '')
    
    return `ReportCard_${studentId}_${semester}_${year}.pdf`
  }
}

/**
 * Main function to generate report card PDF
 */
export async function generateReportCardPdf(data: ReportCardData): Promise<void> {
  const generator = new ReportCardPdfGenerator()
  generator.generateReportCard(data)
}

/**
 * Validate data before PDF generation
 */
export function validateReportCardData(data: ReportCardData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required student data
  if (!data.student.name || data.student.name.trim() === '') {
    errors.push('Student name is required')
  }

  if (!data.student.studentId || data.student.studentId.trim() === '') {
    errors.push('Student ID is required')
  }

  // Check subjects data
  if (!data.subjects || data.subjects.length === 0) {
    errors.push('No subjects found for report card')
  }

  // Check each subject has valid data
  data.subjects.forEach((subject, index) => {
    if (!subject.courseCode || !subject.courseName) {
      errors.push(`Subject ${index + 1} is missing course information`)
    }

    if (!subject.assessments || subject.assessments.length === 0) {
      errors.push(`Subject ${subject.courseCode} has no assessments`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}