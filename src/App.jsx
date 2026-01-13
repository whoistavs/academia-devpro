
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminBackdoor from './pages/AdminBackdoor';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CompleteProfile from './pages/CompleteProfile';
import PaymentStatus from './pages/PaymentStatus';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import AdminDashboard from './pages/AdminDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import CourseEditor from './pages/CourseEditor';
import LessonView from './pages/LessonView';
import Quiz from './pages/Quiz';
import Certificate from './pages/Certificate';
import AdminCoupons from './pages/AdminCoupons';

import CookieBanner from './components/CookieBanner';
import ScrollToTop from './components/ScrollToTop';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});


const ProtectedRoute = ({ children, requireProfile = true }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  
  if (requireProfile && user && !user.profileCompleted) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
};

const Layout = () => {
  const { theme } = useTheme();
  return (
    <div
      style={{ colorScheme: theme }}
      className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300"
    >
      <Navbar />
      <Routes>
        {}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-force" element={<AdminBackdoor />} />
        <Route path="/cadastro" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/recover-password" element={<ForgotPassword />} />
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos" element={<Terms />} />
        <Route path="/contato" element={<Contact />} />

        {}
        <Route path="/complete-profile" element={
          <ProtectedRoute requireProfile={false}>
            <CompleteProfile />
          </ProtectedRoute>
        } />

        {}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/payment/:status" element={<ProtectedRoute><PaymentStatus /></ProtectedRoute>} />

        <Route path="/cursos" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/curso/:slug" element={<ProtectedRoute><CourseDetails /></ProtectedRoute>} />
        <Route path="/curso/:slug/aula/:id" element={<ProtectedRoute><LessonView /></ProtectedRoute>} />
        <Route path="/curso/:slug/prova" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />

        <Route path="/certificado/:slug" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/coupons" element={<ProtectedRoute><AdminCoupons /></ProtectedRoute>} />

        <Route path="/professor" element={<ProtectedRoute><ProfessorDashboard /></ProtectedRoute>} />
        <Route path="/professor/editor" element={<ProtectedRoute><CourseEditor /></ProtectedRoute>} />
        <Route path="/professor/editor/:id" element={<ProtectedRoute><CourseEditor /></ProtectedRoute>} />
      </Routes>
      <Footer />
      <CookieBanner />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Router>
              <ScrollToTop />
              <Layout />
            </Router>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
