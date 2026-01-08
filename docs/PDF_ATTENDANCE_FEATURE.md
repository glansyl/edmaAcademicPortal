# PDF Attendance Download Feature

## Overview
Teachers can now download attendance records as professionally formatted PDF documents directly from the Manage Attendance page.

## Feature Location
**Teacher Dashboard → Manage Attendance → Mark Attendance Mode**

## How to Use

1. **Select a Course**: Choose the course from the dropdown
2. **Select Date**: Pick the attendance date
3. **Mark Attendance**: Set status for each student (Present/Absent/Late/Excused)
4. **Download PDF**: Click "Download Attendance (PDF)" button
5. **Save Attendance**: Click "Save Attendance" to persist to database

## PDF Content

### Header Section
- Institution Name: "Academic Portal"
- Report Title: "Attendance Report"
- Course Name and Code
- Attendance Date (formatted)
- Teacher Name

### Main Table
Columns:
- Student ID
- Student Name
- Class
- Attendance Status (text format)

Features:
- Clean grid borders
- Alternating row colors for readability
- Professional blue header
- Consistent column widths
- Automatic pagination for long lists

### Footer Section
- Generation timestamp
- Page numbers (Page X of Y)

## Technical Implementation

### Libraries Used
- **jsPDF**: Core PDF generation
- **jspdf-autotable**: Professional table formatting with auto-pagination

### Key Files
- `frontend/src/utils/attendancePdfGenerator.ts` - PDF generation utility
- `frontend/src/pages/teacher/TeacherAttendance.tsx` - UI integration

### Security
- Only teachers can access this feature
- Teachers can only download attendance for their assigned courses
- No exposure of unrelated student data

### Error Handling
- Button disabled when no course selected
- Button disabled when no students loaded
- Loading state during PDF generation
- User-friendly error messages via toast notifications
- Prevents duplicate clicks during generation

## File Naming Convention
Generated PDFs are named: `Attendance_{CourseCode}_{Date}.pdf`

Example: `Attendance_CS101_2026-01-08.pdf`

## Browser Compatibility
Works in all modern browsers that support:
- ES6+ JavaScript
- Blob API
- File download API

## Notes
- PDF reflects current marked state (before or after save)
- Multi-page support for courses with many students
- Text-based status (no icons in PDF for better printing)
- Professional formatting suitable for official records
