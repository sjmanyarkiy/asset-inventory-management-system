import React, { useState } from 'react'
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { setUser, setToken } from '../redux/slices/authSlice';

function LoginPage() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        formData
      );

      const { user, access_token: token } = response.data.data;

      dispatch(setUser(user));
      dispatch(setToken(token));
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(user))

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      navigate('/dashboard')
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col md={5}>
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary mb-2">Asset Inventory</h2>
                  <p className="text-muted">Sign In to Your Account</p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
                    <Alert.Heading className="mb-2">Log In Failed</Alert.Heading>
                    <p className="mb-0">{error}</p>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-500">Username or Email</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter your username or email"
                        disabled={loading}
                        required
                        size="lg"
                      />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-500">Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        disabled={loading}
                        required
                        size="lg"
                      />
                      {/* <button
                        type="button"
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex="-1"
                        style={{ textDecoration: 'none', fontSize: '18px' }}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button> */}
                    </div>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 fw-bold mt-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation='border' size="sm" className='me-2'/>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </Form>

                {/* Footer */}
                <div className="text-center mt-4">
                  <p className="text-muted mb-2">
                    Don't have an account? <Link to="/register" className="text-primary fw-bold text-decoration-none">Create one</Link>
                  </p>
                  <Link to="/forgot-password" className="text-muted text-decoration-none small">Forgot password?</Link>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>   
    </div>
  )
}

export default LoginPage
