/**
 * Report Card PDF Service
 * Integrates data preparation and PDF generation for student report cards
 */

import { reportCardService } from './reportCardService'
import { generateReportCardPdf, validateReportCardData } from '@/utils/reportCardPdfGenerator'
import { logger } from '@/lib/logger'

export interface ReportCardGenerationResult {
  success: boolean
  message: string
  fileName?: string
  errors?: string[]
}

export class ReportCardPdfService {
  /**
   * Generate and download student report card PDF
   */
  async generateAndDownloadReportCard(): Promise<ReportCardGenerationResult> {
    try {
      logger.log('Starting report card generation...')

      // Step 1: Validate that student has marks data
      const validation = await reportCardService.validateReportCardData()
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message || 'No marks data available for report card generation.'
        }
      }

      // Step 2: Generate report card data
      logger.log('Fetching and aggregating report card data...')
      const reportCardData = await reportCardService.generateReportCardData()

      // Step 3: Validate the aggregated data
      const dataValidation = validateReportCardData(reportCardData)
      if (!dataValidation.isValid) {
        logger.error('Report card data validation failed:', dataValidation.errors)
        return {
          success: false,
          message: 'Report card data is incomplete or invalid.',
          errors: dataValidation.errors
        }
      }

      // Step 4: Generate PDF
      logger.log('Generating PDF document...')
      generateReportCardPdf(reportCardData)

      // Step 5: Generate filename for user reference
      const fileName = this.generateFileName(reportCardData.student.studentId, reportCardData.academicInfo)

      logger.log('Report card PDF generated successfully')
      return {
        success: true,
        message: 'Report card downloaded successfully!',
        fileName
      }

    } catch (error) {
      logger.error('Failed to generate report card:', error)
      
      // Provide user-friendly error messages
      let message = 'Failed to generate report card. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          message = 'Unable to load your marks data. Please check your connection and try again.'
        } else if (error.message.includes('PDF')) {
          message = 'Failed to generate PDF document. Please try again.'
        } else if (error.message.includes('auth')) {
          message = 'Authentication error. Please log in again.'
        }
      }

      return {
        success: false,
        message
      }
    }
  }

  /**
   * Check if student is eligible for report card generation
   */
  async checkEligibility(): Promise<{ eligible: boolean; message?: string }> {
    try {
      const validation = await reportCardService.validateReportCardData()
      return {
        eligible: validation.isValid,
        message: validation.message
      }
    } catch (error) {
      logger.error('Failed to check report card eligibility:', error)
      return {
        eligible: false,
        message: 'Unable to check eligibility. Please try again later.'
      }
    }
  }

  /**
   * Get report card preview data (without generating PDF)
   */
  async getReportCardPreview() {
    try {
      const reportCardData = await reportCardService.generateReportCardData()
      
      return {
        success: true,
        data: {
          studentName: reportCardData.student.name,
          studentId: reportCardData.student.studentId,
          totalSubjects: reportCardData.summary.totalSubjects,
          averagePercentage: reportCardData.summary.averagePercentage,
          overallGrade: reportCardData.summary.overallGrade,
          gpa: reportCardData.summary.gpa,
          totalCredits: reportCardData.summary.totalCredits,
          academicYear: reportCardData.academicInfo.academicYear,
          semester: reportCardData.academicInfo.semester
        }
      }
    } catch (error) {
      logger.error('Failed to get report card preview:', error)
      return {
        success: false,
        message: 'Unable to load report card preview.'
      }
    }
  }

  /**
   * Generate filename for the report card
   */
  private generateFileName(studentId: string, academicInfo: any): string {
    const cleanStudentId = studentId.replace(/[^a-zA-Z0-9]/g, '')
    const semester = academicInfo.semester.replace(/\s+/g, '')
    const year = academicInfo.academicYear.replace(/[^0-9-]/g, '')
    
    return `ReportCard_${cleanStudentId}_${semester}_${year}.pdf`
  }
}

// Create singleton instance
export const reportCardPdfService = new ReportCardPdfService()

/**
 * Convenience function for quick report card generation
 */
export async function downloadReportCard(): Promise<ReportCardGenerationResult> {
  return reportCardPdfService.generateAndDownloadReportCard()
}

/**
 * Convenience function to check if report card can be generated
 */
export async function canGenerateReportCard(): Promise<boolean> {
  const eligibility = await reportCardPdfService.checkEligibility()
  return eligibility.eligible
}