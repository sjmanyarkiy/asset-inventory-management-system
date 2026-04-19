import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RequestApprovalPage from '../pages/RequestApprovalPage';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('RequestApprovalPage', () => {
  
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'fake-token')
      },
      writable: true
    });
  });
  
  test('displays pending asset requests', async () => {
    const mockRequests = [
      {
        id: 1,
        asset_type: { name: 'Laptop' },
        quantity: 2,
        urgency: 'High',
        status: 'Pending',
        created_at: new Date().toISOString(),
        requested_by: { first_name: 'Alice', last_name: 'Employee' }
      }
    ];
    
    axios.get.mockResolvedValue({
      data: { requests: mockRequests }
    });
    
    render(<RequestApprovalPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
  
  test('shows approval modal when approve button clicked', async () => {
    axios.get.mockResolvedValue({
      data: {
        requests: [
          {
            id: 1,
            asset_type: { name: 'Laptop' },
            quantity: 1,
            status: 'Pending',
            urgency: 'High',
            created_at: new Date().toISOString(),
            requested_by: { first_name: 'Alice' }
          }
        ]
      }
    });
    
    render(<RequestApprovalPage />);
    
    await waitFor(() => {
      const approveButton = screen.getAllByRole('button').find(btn => btn.textContent.includes('✓'));
      fireEvent.click(approveButton);
    });
    
    expect(screen.getByText(/Approve Request/i)).toBeInTheDocument();
  });
  
  test('sends approval request to backend', async () => {
    axios.get.mockResolvedValue({
      data: {
        requests: [
          {
            id: 1,
            asset_type: { name: 'Laptop' },
            quantity: 1,
            status: 'Pending',
            urgency: 'High',
            created_at: new Date().toISOString(),
            requested_by: { first_name: 'Alice' }
          }
        ]
      }
    });
    
    axios.post.mockResolvedValue({
      data: { message: 'Request approved' }
    });
    
    render(<RequestApprovalPage />);
    
    // Open modal
    await waitFor(() => {
      const approveButton = screen.getAllByRole('button').find(btn => btn.textContent.includes('✓'));
      fireEvent.click(approveButton);
    });
    
    // Click final approve
    const submitButton = screen.getByText(/Approve Request/);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/review/assets/1/approve'),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });
});