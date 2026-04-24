import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';

export const metadata = { title: 'Student — UCEOU Attendance' };

export default function StudentLayout({ children }) {
  return (
    <ProtectedRoute role="student">
      <Navbar />
      {children}
    </ProtectedRoute>
  );
}
