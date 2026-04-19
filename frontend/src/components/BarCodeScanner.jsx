import React, { useRef, useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const BarcodeScanner = ({ onAssetFound, onError }) => {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleBarcodeScan = async (e) => {
    e.preventDefault();
    
    if (!barcode.trim()) {
      setError('Please enter a barcode');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const response = await axios.get(
        `${API_URL}/api/assets/barcode/${barcode}`,
        { headers }
      );

      onAssetFound(response.data.asset);
      setBarcode('');
      inputRef.current?.focus();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Asset not found';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="barcode-scanner my-4">
      <h5>🔍 Scan Asset Barcode</h5>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleBarcodeScan}>
        <Form.Group>
          <Form.Label>Barcode Input</Form.Label>
          <Form.Control
            ref={inputRef}
            type="text"
            placeholder="Scan barcode or enter asset code..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value.toUpperCase())}
            autoFocus
          />
          <Form.Text className="text-muted">
            Position barcode scanner and press Enter, or type asset code
          </Form.Text>
        </Form.Group>
        
        <Button 
          variant="primary" 
          type="submit" 
          disabled={loading}
          className="mt-2"
        >
          {loading ? '⏳ Scanning...' : '📊 Scan'}
        </Button>
      </Form>
    </div>
  );
};

export default BarcodeScanner;