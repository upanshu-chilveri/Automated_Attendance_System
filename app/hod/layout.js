import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';

export const metadata = { title: 'HOD — UCEOU Attendance' };

export default function HodLayout({ children }) {
  return (
    <ProtectedRoute role="hod">
      <Navbar />
      {children}
    </ProtectedRoute>
  );
}
