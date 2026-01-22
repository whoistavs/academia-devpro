import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import React from 'react';


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
                <button onClick={() => login({ email: 'test@example.com' }, 'fake-token')}>Login</button>
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


        expect(screen.queryByTestId('user-email')).toBeNull();


        fireEvent.click(screen.getByText('Login'));


        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
        expect(localStorage.getItem('token')).toBe('fake-token');


        fireEvent.click(screen.getByText('Logout'));


        expect(screen.queryByTestId('user-email')).toBeNull();
        expect(localStorage.getItem('token')).toBeNull();
    });
});
