import React, { useState, useEffect } from 'react';
import axios from '../../src/api/axios';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';

const AssetRequestForm = ({ onRequestSubmitted }) => {
  const [formData, setFormData] = useState({
    asset_type_id: '',
    quantity: 1,
    reason: '',
    urgency: 'Medium'
  });

  const [assetTypes, setAssetTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch asset types on mount
  useEffect(() => {
    fetchAssetTypes();
  }, []);

  const fetchAssetTypes = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${API_URL}/api/asset-types`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setAssetTypes(response.data.data || response.data || []);
    } catch (err) {
      console.error('Failed to fetch asset types:', err);
      setAssetTypes([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const user = JSON.parse(localStorage.getItem('user'));
    formData.department_id = user.department_id; 

    // Validation
    if (!formData.asset_type_id) {
      setError('Please select an asset type');
      return;
    }
    if (formData.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    if (!formData.reason.trim()) {
      setError('Please provide a reason for the request');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_URL}/api/requests/assets`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Asset request submitted successfully!');
      setFormData({
        asset_type_id: '',
        quantity: 1,
        reason: '',
        urgency: 'Medium'
      });

      // Refresh parent's request list if callback provided
      if (onRequestSubmitted) {
        onRequestSubmitted();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to submit request';
      setError(errorMsg);
      console.error('Request error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h4 className="mb-4 fw-bold">Request New Asset</h4>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Asset Type */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-500">Asset Type *</Form.Label>
          <Form.Select
            name="asset_type_id"
            value={formData.asset_type_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Asset Type --</option>
            {assetTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Quantity */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-500">Quantity *</Form.Label>
          <Form.Control
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            required
          />
        </Form.Group>

        {/* Reason */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-500">Reason for Request *</Form.Label>
          <Form.Control
            as="textarea"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            placeholder="Please explain why you need this asset..."
            required
          />
          <Form.Text className="text-muted">
            Be specific about your needs (e.g., for new hire, replacement, project)
          </Form.Text>
        </Form.Group>

        {/* Urgency */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-500">Urgency Level</Form.Label>
          <Form.Select
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Form.Select>
        </Form.Group>

        {/* Submit Button */}
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              setFormData({
                asset_type_id: '',
                quantity: 1,
                reason: '',
                urgency: 'Medium'
              });
              setError('');
              setSuccess('');
            }}
            disabled={loading}
          >
            Reset
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AssetRequestForm;