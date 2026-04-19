import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../components/Login';
import { AuthProvider } from '../AuthContext';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(() =>
      Promise.resolve({
        data: { access_token: 'tok', user: { id: 1, name: 'Alice', role: 'EMPLOYEE' } },
      })
    ),
  },
}));

test('login form submits and navigates', async () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'alice@example.com' } });
  fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'testpass' } });

  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() => expect(localStorage.getItem('token')).toBeTruthy());
});
