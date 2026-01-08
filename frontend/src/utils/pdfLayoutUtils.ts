/**
 * PDF Layout Utilities
 * Helper functions for consistent PDF formatting and layout management
 */

import jsPDF from 'jspdf'

export interface PageDimensions {
  width: number
  height: number
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
  contentWidth: number
  contentHeight: number
}

export interface TextMetrics {
  width: number
  height: number
  lines: string[]
}

/**
 * Get standard page dimensions with margins
 */
export function getPageDimensions(doc: jsPDF): PageDimensions {
  const width = doc.internal.pageSize.getWidth()
  const height = doc.internal.pageSize.getHeight()
  const marginTop = 20
  const marginBottom = 20
  const marginLeft = 20
  const marginRight = 20
  
  return {
    width,
    height,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    contentWidth: width - marginLeft - marginRight,
    contentHeight: height - marginTop - marginBottom
  }
}

/**
 * Calculate text metrics for given text and font settings
 */
export function getTextMetrics(
  doc: jsPDF, 
  text: string, 
  maxWidth?: number
): TextMetrics {
  const lines = maxWidth 
    ? doc.splitTextToSize(text, maxWidth) 
    : [text]
  
  const lineHeight = doc.getLineHeight() / doc.internal.scaleFactor
  const width = Math.max(...lines.map(line => doc.getTextWidth(line)))
  const height = lines.length * lineHeight
  
  return { width, height, lines }
}

/**
 * Check if content fits on current page
 */
export function checkPageSpace(
  currentY: number, 
  contentHeight: number, 
  dimensions: PageDimensions
): boolean {
  return (currentY + contentHeight) <= (dimensions.height - dimensions.marginBottom)
}

/**
 * Add a new page if needed
 */
export function addPageIfNeeded(
  doc: jsPDF, 
  currentY: number, 
  requiredHeight: number, 
  dimensions: PageDimensions
): number {
  if (!checkPageSpace(currentY, requiredHeight, dimensions)) {
    doc.addPage()
    return dimensions.marginTop
  }
  return currentY
}

/**
 * Draw a bordered section
 */
export function drawBorderedSection(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    fillColor?: [number, number, number]
    borderColor?: [number, number, number]
    borderWidth?: number
    cornerRadius?: number
  } = {}
): void {
  const {
    fillColor = [255, 255, 255],
    borderColor = [200, 200, 200],
    borderWidth = 0.5,
    cornerRadius = 0
  } = options

  doc.setDrawColor(...borderColor)
  doc.setFillColor(...fillColor)
  doc.setLineWidth(borderWidth)

  if (cornerRadius > 0) {
    doc.roundedRect(x, y, width, height, cornerRadius, cornerRadius, 'FD')
  } else {
    doc.rect(x, y, width, height, 'FD')
  }
}

/**
 * Draw a horizontal line separator
 */
export function drawHorizontalLine(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  options: {
    color?: [number, number, number]
    width?: number
    style?: 'solid' | 'dashed'
  } = {}
): void {
  const {
    color = [200, 200, 200],
    width: lineWidth = 0.5,
    style = 'solid'
  } = options

  doc.setDrawColor(...color)
  doc.setLineWidth(lineWidth)

  if (style === 'dashed') {
    doc.setLineDashPattern([2, 2], 0)
  }

  doc.line(x, y, x + width, y)

  if (style === 'dashed') {
    doc.setLineDashPattern([], 0) // Reset to solid
  }
}

/**
 * Center text horizontally
 */
export function centerText(
  doc: jsPDF,
  text: string,
  y: number,
  pageWidth?: number
): void {
  const width = pageWidth || doc.internal.pageSize.getWidth()
  doc.text(text, width / 2, y, { align: 'center' })
}

/**
 * Format text to fit within specified width
 */
export function formatTextToWidth(
  doc: jsPDF,
  text: string,
  maxWidth: number
): string[] {
  return doc.splitTextToSize(text, maxWidth)
}

/**
 * Calculate optimal column widths for table
 */
export function calculateColumnWidths(
  totalWidth: number,
  columnCount: number,
  preferredWidths?: number[]
): number[] {
  if (preferredWidths && preferredWidths.length === columnCount) {
    const totalPreferred = preferredWidths.reduce((sum, width) => sum + width, 0)
    if (totalPreferred <= totalWidth) {
      return preferredWidths
    }
    // Scale down proportionally
    const scale = totalWidth / totalPreferred
    return preferredWidths.map(width => width * scale)
  }

  // Equal width distribution
  const equalWidth = totalWidth / columnCount
  return new Array(columnCount).fill(equalWidth)
}

/**
 * Truncate text with ellipsis if too long
 */
export function truncateText(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  ellipsis: string = '...'
): string {
  if (doc.getTextWidth(text) <= maxWidth) {
    return text
  }

  let truncated = text
  while (doc.getTextWidth(truncated + ellipsis) > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1)
  }

  return truncated + ellipsis
}

/**
 * Add watermark to page
 */
export function addWatermark(
  doc: jsPDF,
  text: string,
  options: {
    opacity?: number
    fontSize?: number
    color?: [number, number, number]
    rotation?: number
  } = {}
): void {
  const {
    opacity = 0.1,
    fontSize = 50,
    color = [128, 128, 128],
    rotation = -45
  } = options

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Save current state
  const currentFontSize = doc.getFontSize()
  const currentTextColor = doc.getTextColor()

  // Set watermark properties
  doc.setFontSize(fontSize)
  doc.setTextColor(...color)
  doc.setGState(new doc.GState({ opacity }))

  // Add rotated text in center
  doc.text(
    text,
    pageWidth / 2,
    pageHeight / 2,
    {
      align: 'center',
      angle: rotation
    }
  )

  // Restore state
  doc.setFontSize(currentFontSize)
  doc.setTextColor(currentTextColor)
  doc.setGState(new doc.GState({ opacity: 1 }))
}

/**
 * Format currency or numeric values
 */
export function formatNumericValue(
  value: number,
  options: {
    decimals?: number
    prefix?: string
    suffix?: string
  } = {}
): string {
  const {
    decimals = 2,
    prefix = '',
    suffix = ''
  } = options

  return `${prefix}${value.toFixed(decimals)}${suffix}`
}

/**
 * Create a professional header with logo space
 */
export function createProfessionalHeader(
  doc: jsPDF,
  title: string,
  subtitle?: string,
  options: {
    logoSpace?: boolean
    headerHeight?: number
    backgroundColor?: [number, number, number]
  } = {}
): number {
  const {
    logoSpace = false,
    headerHeight = 40,
    backgroundColor = [245, 247, 250]
  } = options

  const dimensions = getPageDimensions(doc)
  
  // Draw header background
  drawBorderedSection(
    doc,
    0,
    0,
    dimensions.width,
    headerHeight,
    {
      fillColor: backgroundColor,
      borderColor: [200, 200, 200],
      borderWidth: 0.5
    }
  )

  let yPosition = 15

  // Add title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(37, 99, 235) // Blue color
  centerText(doc, title, yPosition)

  yPosition += 8

  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(75, 85, 99) // Gray color
    centerText(doc, subtitle, yPosition)
    yPosition += 6
  }

  return headerHeight + 10 // Return next Y position
}