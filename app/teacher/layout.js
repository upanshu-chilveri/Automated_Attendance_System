import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';

export const metadata = { title: 'Teacher — UCEOU Attendance' };

export default function TeacherLayout({ children }) {
  return (
    <ProtectedRoute role="teacher">
      <Navbar />
      {children}
    </ProtectedRoute>
  );
}
