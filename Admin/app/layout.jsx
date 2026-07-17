import React from 'react';
import { AdminAuthProvider } from '../context/AdminAuthContext';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata = {
  title: '3Pahia - Admin Dashboard',
  description: 'Administrative dashboard for 3Pahia marketplace.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AdminAuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#1A1A1A',
                color: '#FFF',
                border: '1px solid #2D2D2D',
              },
            }}
          />
        </AdminAuthProvider>
      </body>
    </html>
  );
}
