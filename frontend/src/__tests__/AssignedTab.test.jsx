import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AssignedTab from '../components/AssignedTab';

jest.mock('../api/axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: { items: [{ assignment_id: 1, asset_name: 'Laptop', assigned_at: '2026-04-02T12:00:00' }] } }))
}));

test('AssignedTab fetches and displays data', async () => {
  render(<AssignedTab />);
  await waitFor(() => screen.getByText(/Laptop/));
  expect(screen.getByText(/Laptop/)).toBeInTheDocument();
});
