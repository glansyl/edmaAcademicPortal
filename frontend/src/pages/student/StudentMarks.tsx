import { useEffect, useState } from 'react'
import { studentService } from '@/services/studentService'
import { Marks } from '@/types'
import { Sidebar } from '@/components/Sidebar'
import { BarChart, Download, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { reportCardService } from '@/services/reportCardService'
import { generateReportCardPdf, validateReportCardData } from '@/utils/reportCardPdfGenerator'

export function StudentMarks() {
  const [marks, setMarks] = useState<Marks[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  useEffect(() => {
    loadMarks()
  }, [])

  const loadMarks = async () => {
    try {
      const data = await studentService.getMyMarks()
      setMarks(data)
    } catch (error) {
      toast.error('Failed to load marks')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      </div>
    )
  }

  const getGrade = (marksObtained: number, maxMarks: number) => {
    const percentage = (marksObtained / maxMarks) * 100
    if (percentage >= 90) return 'A+'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B+'
    if (percentage >= 60) return 'B'
    if (percentage >= 50) return 'C'
    return 'F'
  }

  const handleDownloadReportCard = async () => {
    if (marks.length === 0) {
      toast.error('No marks available for report card generation')
      return
    }

    setIsGeneratingPdf(true)
    
    try {
      // Validate data availability
      const validation = await reportCardService.validateReportCardData()
      if (!validation.isValid) {
        toast.error(validation.message || 'Unable to generate report card')
        return
      }

      // Generate report card data
      const reportCardData = await reportCardService.generateReportCardData()
      
      // Validate PDF data
      const pdfValidation = validateReportCardData(reportCardData)
      if (!pdfValidation.isValid) {
        toast.error('Report card data is incomplete: ' + pdfValidation.errors.join(', '))
        return
      }

      // Generate and download PDF
      await generateReportCardPdf(reportCardData)
      
      toast.success('Report card downloaded successfully!')
      
    } catch (error) {
      console.error('Failed to generate report card:', error)
      toast.error('Failed to generate report card. Please try again.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Marks</h1>
          
          {/* Download Report Card Button */}
          <button
            onClick={handleDownloadReportCard}
            disabled={marks.length === 0 || isGeneratingPdf}
            className={`
              inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors
              ${marks.length === 0 || isGeneratingPdf
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }
            `}
          >
            {isGeneratingPdf ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white mr-2" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download Report Card (PDF)
              </>
            )}
          </button>
        </div>

        {marks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No marks available</h3>
            <p className="mt-2 text-sm text-gray-500">
              You don't have any marks recorded yet. Report card will be available once marks are entered.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {marks.map((mark) => {
                    const percentage = (mark.marksObtained / mark.maxMarks) * 100
                    const grade = getGrade(mark.marksObtained, mark.maxMarks)
                    return (
                      <tr key={mark.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {mark.courseName || mark.course?.courseName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {mark.examType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {mark.marksObtained} / {mark.maxMarks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {percentage.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-900 text-white">
                            {grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(mark.examDate).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
