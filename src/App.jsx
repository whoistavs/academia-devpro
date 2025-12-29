import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import React from 'react';

import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import AdminDashboard from './pages/AdminDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import CourseEditor from './pages/CourseEditor';
import LessonView from './pages/LessonView';
import Quiz from './pages/Quiz';
import CookieBanner from './components/CookieBanner';
import Certificate from './pages/Certificate';

const Layout = () => {
  const { theme } = useTheme();
  return (
    <div
      style={{ colorScheme: theme }}
      className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300"
    >
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Signup />} />
        <Route path="/cursos" element={<Courses />} />
        <Route path="/curso/:slug" element={<CourseDetails />} />
        <Route path="/curso/:slug/aula/:id" element={<LessonView />} />
        <Route path="/curso/:slug/prova" element={<Quiz />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/professor" element={<ProfessorDashboard />} />
        <Route path="/professor/editor" element={<CourseEditor />} />
        <Route path="/professor/editor/:id" element={<CourseEditor />} />
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos" element={<Terms />} />
        <Route path="/certificado/:slug" element={<Certificate />} />
      </Routes>
      <Footer />
      <CookieBanner />
    </div>
  );
};

import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
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
  );
}

export default App;
