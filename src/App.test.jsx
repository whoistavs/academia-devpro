import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

// Mock AuthContext to simulate logged out state
// We need to wrap components with necessary providers
const AllProviders = ({ children }) => (
    <MemoryRouter>
        <AuthProvider>
            <LanguageProvider>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </LanguageProvider>
        </AuthProvider>
    </MemoryRouter>
);

describe('App Smoke Tests', () => {
    it('renders Navbar without crashing', () => {
        render(
            <AllProviders>
                <Navbar />
            </AllProviders>
        );
        // Check for common navbar elements
        expect(screen.getByAltText('DevPro Academy')).toBeInTheDocument();
        expect(screen.getByText('Entrar')).toBeInTheDocument(); // Default logged out state
    });
});
