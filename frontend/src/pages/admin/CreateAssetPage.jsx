import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CreateAssetPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    asset_name: '',
    asset_code: '',
    asset_type_id: '',
    asset_category_id: '',
    vendor_id: '',
    department_id: '',
    serial_number: '',
    purchase_date: '',
    cost: '',
    status: 'Available'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/api/assets`, formData);
      setSuccess('Asset created successfully!');
      setTimeout(() => navigate('/admin/assets'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-lg border-0">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0 fw-bold">Create New Asset</h4>
        </Card.Header>
        <Card.Body className="p-4">
          {success && <Alert variant="success">{success}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Asset Name *</Form.Label>
              <Form.Control 
                name="asset_name" 
                value={formData.asset_name}
                onChange={handleChange}
                required 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Asset Code *</Form.Label>
              <Form.Control 
                name="asset_code" 
                value={formData.asset_code}
                onChange={handleChange}
                required 
              />
            </Form.Group>

            {/* Dropdowns for FKs */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label className="fw-semibold">Asset Type</Form.Label>
                <Form.Select name="asset_type_id" onChange={handleChange} required>
                  <option value="">Select Type</option>
                  {/* Load from /api/asset-types */}
                </Form.Select>
              </div>
              {/* Similar for category, vendor, dept */}
            </div>

            <div className="d-flex gap-2">
              <Button type="submit" className="flex-grow-1" disabled={loading}>
                {loading ? <Spinner size="sm" className="me-2" /> : null}
                Create Asset
              </Button>
              <Button variant="secondary" onClick={() => navigate('/admin/assets')}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateAssetPage;