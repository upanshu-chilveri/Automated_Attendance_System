import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AttendanceProvider } from '@/context/AttendanceContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'UCEOU Attendance System',
  description: 'Role-based attendance management dashboard for UCEOU',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          <AttendanceProvider>
            {children}
          </AttendanceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
