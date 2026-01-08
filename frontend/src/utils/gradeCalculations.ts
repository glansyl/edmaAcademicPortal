/**
 * Grade calculation utilities for academic report cards
 * Provides standardized grade calculation and formatting functions
 */

export interface GradeInfo {
  letter: string
  points: number
  description: string
}

/**
 * Calculate letter grade from percentage
 * Uses standard academic grading scale
 */
export function calculateLetterGrade(percentage: number): string {
  if (percentage >= 90) return 'A+'
  if (percentage >= 85) return 'A'
  if (percentage >= 80) return 'A-'
  if (percentage >= 75) return 'B+'
  if (percentage >= 70) return 'B'
  if (percentage >= 65) return 'B-'
  if (percentage >= 60) return 'C+'
  if (percentage >= 55) return 'C'
  if (percentage >= 50) return 'C-'
  if (percentage >= 45) return 'D'
  return 'F'
}

/**
 * Calculate grade points from percentage (4.0 scale)
 */
export function calculateGradePoints(percentage: number): number {
  if (percentage >= 90) return 4.0
  if (percentage >= 85) return 4.0
  if (percentage >= 80) return 3.7
  if (percentage >= 75) return 3.3
  if (percentage >= 70) return 3.0
  if (percentage >= 65) return 2.7
  if (percentage >= 60) return 2.3
  if (percentage >= 55) return 2.0
  if (percentage >= 50) return 1.7
  if (percentage >= 45) return 1.3
  return 0.0
}

/**
 * Get comprehensive grade information
 */
export function getGradeInfo(percentage: number): GradeInfo {
  const letter = calculateLetterGrade(percentage)
  const points = calculateGradePoints(percentage)
  
  let description = ''
  if (percentage >= 90) description = 'Excellent'
  else if (percentage >= 80) description = 'Very Good'
  else if (percentage >= 70) description = 'Good'
  else if (percentage >= 60) description = 'Satisfactory'
  else if (percentage >= 50) description = 'Pass'
  else description = 'Fail'

  return { letter, points, description }
}

/**
 * Calculate weighted average percentage
 */
export function calculateWeightedAverage(
  marks: Array<{ marksObtained: number; maxMarks: number; weight?: number }>
): number {
  if (marks.length === 0) return 0

  const totalWeight = marks.reduce((sum, mark) => sum + (mark.weight || 1), 0)
  const weightedSum = marks.reduce((sum, mark) => {
    const percentage = (mark.marksObtained / mark.maxMarks) * 100
    return sum + (percentage * (mark.weight || 1))
  }, 0)

  return weightedSum / totalWeight
}

/**
 * Calculate GPA from multiple course percentages
 */
export function calculateGPA(coursePercentages: number[], credits?: number[]): number {
  if (coursePercentages.length === 0) return 0

  if (credits && credits.length === coursePercentages.length) {
    // Credit-weighted GPA
    const totalCredits = credits.reduce((sum, credit) => sum + credit, 0)
    const weightedPoints = coursePercentages.reduce((sum, percentage, index) => {
      return sum + (calculateGradePoints(percentage) * credits[index])
    }, 0)
    return totalCredits > 0 ? weightedPoints / totalCredits : 0
  } else {
    // Simple average GPA
    const totalPoints = coursePercentages.reduce((sum, percentage) => {
      return sum + calculateGradePoints(percentage)
    }, 0)
    return totalPoints / coursePercentages.length
  }
}

/**
 * Format percentage for display
 */
export function formatPercentage(percentage: number, decimals: number = 2): string {
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Format GPA for display
 */
export function formatGPA(gpa: number, decimals: number = 2): string {
  return gpa.toFixed(decimals)
}