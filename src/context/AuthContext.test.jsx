import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import React from 'react';

// Mock Component to test hook
const TestComponent = () => {
    const { user, login, logout } = useAuth();
    return (
        <div>
            {user ? (
                <>
                    <span data-testid="user-email">{user.email}</span>
                    <button onClick={logout}>Logout</button>
                </>
            ) : (
                <button onClick={() => login('fake-token', { email: 'test@example.com' })}>Login</button>
            )}
        </div>
    );
};

describe('AuthContext', () => {
    it('provides login and logout functionality', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Check initial state (logged out)
        expect(screen.queryByTestId('user-email')).toBeNull();

        // Perform login
        fireEvent.click(screen.getByText('Login'));

        // Check logged in state
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
        expect(localStorage.getItem('token')).toBe('fake-token');

        // Perform logout
        fireEvent.click(screen.getByText('Logout'));

        // Check logged out state
        expect(screen.queryByTestId('user-email')).toBeNull();
        expect(localStorage.getItem('token')).toBeNull();
    });
});
