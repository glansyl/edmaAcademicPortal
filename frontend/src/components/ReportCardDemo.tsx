/**
 * Report Card Demo Component
 * For testing PDF generation functionality during development
 * This component should be removed in production
 */

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Download, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { testReportCardPdfGeneration, runAllPdfTests, generateMockReportCardData } from '@/utils/reportCardPdfTest'
import { reportCardPdfService } from '@/services/reportCardPdfService'
import toast from 'react-hot-toast'

export function ReportCardDemo() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  const handleTestMockPdf = () => {
    try {
      console.log('🧪 Running mock PDF test...')
      testReportCardPdfGeneration()
      toast.success('Mock PDF generated! Check your downloads folder.')
      setTestResults(prev => [...prev, `✅ Mock PDF test completed at ${new Date().toLocaleTimeString()}`])
    } catch (error) {
      console.error('Mock PDF test failed:', error)
      toast.error('Mock PDF test failed')
      setTestResults(prev => [...prev, `❌ Mock PDF test failed at ${new Date().toLocaleTimeString()}`])
    }
  }

  const handleTestRealPdf = async () => {
    setIsGenerating(true)
    try {
      console.log('🧪 Testing real PDF generation...')
      const result = await reportCardPdfService.generateAndDownloadReportCard()
      
      if (result.success) {
        toast.success(result.message)
        setTestResults(prev => [...prev, `✅ Real PDF generated: ${result.fileName} at ${new Date().toLocaleTimeString()}`])
      } else {
        toast.error(result.message)
        setTestResults(prev => [...prev, `❌ Real PDF failed: ${result.message} at ${new Date().toLocaleTimeString()}`])
      }
    } catch (error) {
      console.error('Real PDF test failed:', error)
      toast.error('Real PDF generation failed')
      setTestResults(prev => [...prev, `❌ Real PDF error at ${new Date().toLocaleTimeString()}`])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRunAllTests = () => {
    try {
      console.log('🧪 Running all PDF tests...')
      runAllPdfTests()
      toast.success('All tests completed! Check console for details.')
      setTestResults(prev => [...prev, `✅ All tests completed at ${new Date().toLocaleTimeString()}`])
    } catch (error) {
      console.error('All tests failed:', error)
      toast.error('Some tests failed')
      setTestResults(prev => [...prev, `❌ Some tests faile