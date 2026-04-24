import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';

export const metadata = { title: 'Parent — UCEOU Attendance' };

export default function ParentLayout({ children }) {
  return (
    <ProtectedRoute role="parent">
      <Navbar />
      {children}
    </ProtectedRoute>
  );
}
