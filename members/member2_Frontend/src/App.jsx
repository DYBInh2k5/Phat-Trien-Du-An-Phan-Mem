/**
 * Tệp gốc ứng dụng Frontend Quản Lý Lớp Học & Học Vụ (HTQLLH).
 * Vị trí: members/member2_Frontend/src/App.jsx
 * Cập nhật: Bật cờ tương thích React Router v7 future flags để loại bỏ hoàn toàn cảnh báo console.
 */
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import AppRouter from './routes/AppRouter.jsx';
import ErrorBoundary from './components/shared/ErrorBoundary.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
