/**
 * Report Card Service
 * Handles data aggregation and preparation for student report card generation
 */

import { studentService } from './studentService'
import { authService } from './authService'
import { Marks, Course, Student, User } from '@/types'
import { calculateLetterGrade, calculateWeightedAverage, calculateGPA, getGradeInfo } from '@/utils/gradeCalculations'

export interface ReportCardAssessment {
  examType: string
  marksObtained: number
  maxMarks: number
  percentage: number
  grade: string
  examDate: string
}

export interface ReportCardSubject {
  courseCode: string
  courseName: string
  credits: number
  assessments: ReportCardAssessment[]
  overallPercentage: number
  overallGrade: string
  totalMarksObtained: number
  totalMaxMarks: number
}

export interface ReportCardStudent {
  name: string
  studentId: string
  className: string
  department: string
  email: string
}

export interface ReportCardAcademicInfo {
  semester: string
  academicYear: string
  generatedDate: string
  generatedTime: string
}

export interface ReportCardSummary {
  totalSubjects: number
  averagePercentage: number
  overallGrade: string
  gpa: number | null
  totalCredits: number | null
  totalMarksObtained: number
  totalMaxMarks: number
  overallPercentage: number
}

export interface ReportCardData {
  student: ReportCardStudent
  academicInfo: ReportCardAcademicInfo
  subjects: ReportCardSubject[]
  summary: ReportCardSummary
}

class ReportCardService {
  /**
   * Generate complete report card data for the current student
   */
  async generateReportCardData(): Promise<ReportCardData> {
    try {
      // Fetch all required data
      const [marks, courses, user, studentProfile] = await Promise.all([
        studentService.getMyMarks(),
        studentService.getMyCourses(),
        authService.getCurrentUser(),
        studentService.getMyProfile()
      ])

      // Get additional data if available
      let gpa: number | null = null
      let totalCredits: number | null = null

      try {
        gpa = await studentService.getMyGPA()
      } catch (error) {
        console.warn('GPA not available:', error)
      }

      try {
        totalCredits = await studentService.getTotalCredits()
      } catch (error) {
        console.warn('Total credits not available:', error)
      }

      // Prepare student information
      const student = this.prepareStudentInfo(user, studentProfile)

      // Prepare academic information
      const academicInfo = this.prepareAcademicInfo()

      // Group marks by course and prepare subjects
      const subjects = this.prepareSubjects(marks, courses)

      // Calculate summary statistics
      const summary = this.calculateSummary(subjects, gpa, totalCredits)

      return {
        student,
        academicInfo,
        subjects,
        summary
      }
    } catch (error) {
      console.error('Failed to generate report card data:', error)
      throw new Error('Failed to prepare report card data. Please try again.')
    }
  }

  /**
   * Prepare student information from user and student profile data
   */
  private prepareStudentInfo(user: User, studentProfile?: Student): ReportCardStudent {
    // Use student profile data if available, fallback to user data
    const fullName = studentProfile 
      ? `${studentProfile.firstName} ${studentProfile.lastName}`
      : (user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.name || 'Student Name')

    return {
      name: fullName,
      studentId: studentProfile?.studentId || user.id.toString(),
      className: studentProfile?.className || 'N/A',
      department: 'Academic Portal', // Use institution name as department
      email: user.email
    }
  }

  /**
   * Prepare academic context information
   */
  private prepareAcademicInfo(): ReportCardAcademicInfo {
    const now = new Date()
    const currentYear = now.getFullYear()
    
    // Determine academic year and semester based on current date
    // This is a simplified logic - adjust based on your academic calendar
    const month = now.getMonth() + 1 // 1-12
    let academicYear: string
    let semester: string

    if (month >= 8) {
      // Fall semester
      academicYear = `${currentYear}-${currentYear + 1}`
      semester = 'Fall'
    } else if (month >= 1 && month <= 5) {
      // Spring semester
      academicYear = `${currentYear - 1}-${currentYear}`
      semester = 'Spring'
    } else {
      // Summer semester
      academicYear = `${currentYear - 1}-${currentYear}`
      semester = 'Summer'
    }

    return {
      semester,
      academicYear,
      generatedDate: now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      generatedTime: now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  /**
   * Group marks by course and prepare subject data
   */
  private prepareSubjects(marks: Marks[], courses: Course[]): ReportCardSubject[] {
    // Group marks by course
    const marksByCourse = new Map<number, Marks[]>()
    
    marks.forEach(mark => {
      const courseId = mark.courseId
      if (!marksByCourse.has(courseId)) {
        marksByCourse.set(courseId, [])
      }
      marksByCourse.get(courseId)!.push(mark)
    })

    // Create course map for easy lookup
    const courseMap = new Map<number, Course>()
    courses.forEach(course => {
      courseMap.set(course.id, course)
    })

    // Process each course
    const subjects: ReportCardSubject[] = []

    marksByCourse.forEach((courseMarks, courseId) => {
      const course = courseMap.get(courseId)
      if (!course) return // Skip if course not found

      // Prepare assessments
      const assessments: ReportCardAssessment[] = courseMarks.map(mark => ({
        examType: mark.examType,
        marksObtained: mark.marksObtained,
        maxMarks: mark.maxMarks,
        percentage: (mark.marksObtained / mark.maxMarks) * 100,
        grade: calculateLetterGrade((mark.marksObtained / mark.maxMarks) * 100),
        examDate: mark.examDate
      }))

      // Calculate overall course performance
      const totalMarksObtained = courseMarks.reduce((sum, mark) => sum + mark.marksObtained, 0)
      const totalMaxMarks = courseMarks.reduce((sum, mark) => sum + mark.maxMarks, 0)
      const overallPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0
      const overallGrade = calculateLetterGrade(overallPercentage)

      subjects.push({
        courseCode: course.courseCode,
        courseName: course.courseName,
        credits: course.credits,
        assessments,
        overallPercentage,
        overallGrade,
        totalMarksObtained,
        totalMaxMarks
      })
    })

    // Sort subjects by course code for consistent ordering
    return subjects.sort((a, b) => a.courseCode.localeCompare(b.courseCode))
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(
    subjects: ReportCardSubject[], 
    gpa: number | null, 
    totalCredits: number | null
  ): ReportCardSummary {
    if (subjects.length === 0) {
      return {
        totalSubjects: 0,
        averagePercentage: 0,
        overallGrade: 'N/A',
        gpa,
        totalCredits,
        totalMarksObtained: 0,
        totalMaxMarks: 0,
        overallPercentage: 0
      }
    }

    // Calculate totals
    const totalMarksObtained = subjects.reduce((sum, subject) => sum + subject.totalMarksObtained, 0)
    const totalMaxMarks = subjects.reduce((sum, subject) => sum + subject.totalMaxMarks, 0)
    const overallPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0

    // Calculate average percentage (simple average of course percentages)
    const averagePercentage = subjects.reduce((sum, subject) => sum + subject.overallPercentage, 0) / subjects.length

    // Calculate overall grade
    const overallGrade = calculateLetterGrade(averagePercentage)

    return {
      totalSubjects: subjects.length,
      averagePercentage,
      overallGrade,
      gpa,
      totalCredits,
      totalMarksObtained,
      totalMaxMarks,
      overallPercentage
    }
  }

  /**
   * Validate if student has sufficient data for report card generation
   */
  async validateReportCardData(): Promise<{ isValid: boolean; message?: string }> {
    try {
      const marks = await studentService.getMyMarks()
      
      if (marks.length === 0) {
        return {
          isValid: false,
          message: 'No marks available. Please contact your instructor.'
        }
      }

      return { isValid: true }
    } catch (error) {
      return {
        isValid: false,
        message: 'Unable to fetch marks data. Please try again later.'
      }
    }
  }
}

export const reportCardService = new ReportCardService()