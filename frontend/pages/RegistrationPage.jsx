import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { setUser, setToken } from '../redux/slices/authSlice';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';


const RegistrationPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if(!formData.email){
            newErrors.email = 'Email is required';
        } else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)){
            newErrors.email = 'Please enter a valid email address'
        }

        if(!formData.username){
            newErrors.username = 'Username is required';
        } else if(formData.username.length < 8) {
            newErrors.username = 'Username must be at least 8 characters'
        } else if(!/^[a-zA-Z0-9_-]+$/.test(formData.username))  {
            newErrors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
        }

        if(formData.password !== formData.password_confirm) {
            newErrors.password_confirm = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length == 0

    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!validateForm()){
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/register`,
                formData
                
            );
            alert('Registration successful! Please check your email to verify your account.');
            navigate('/check-email');  // New page

            const { user, access_token: token } = response.data.data;

            dispatch(setUser(user));
            dispatch(setToken(token))
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            navigate('/dashboard')

        } catch (err) {
            const serverErrors = {};
            const errorMessage = err.response?.data?.error;

            if(errorMessage) {
                if (errorMessage.includes('Email')){
                    serverErrors.email = errorMessage;
                } else if (errorMessage.includes('Username')) {
                    serverErrors.username = errorMessage;
                } else if (errorMessage.includes('Password')) {
                    serverErrors.password = errorMessage
                } else {
                    serverErrors.general = errorMessage
                }
            }

            setErrors(serverErrors);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} lg={5}>
                        <div className="card shadow-lg border-0">
                            <div className="card-body p-5">
                                {/* Header */}
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold text-primary mb-2">Asset Inventory</h2>
                                    <p className="text-muted">Create a new account</p>
                                </div>


                                {/* Error Alert */}
                                {errors.general && (
                                    <Alert variant='danger' className='mb-4' dismissible onClose={() => setErrors({...errors, general: '' })}>
                                        <p className='mb-0'>{errors.general}</p>
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    {/* Name Row */}
                                    <Row className='mb-3'>
                                        <Col sm={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-500 small">First Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="first_name"
                                                    value={formData.first_name}
                                                    onChange={handleChange}
                                                    placeholder="First name"
                                                    disabled={loading}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-500 small">Last Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="last_name"
                                                    value={formData.last_name}
                                                    onChange={handleChange}
                                                    placeholder="Last name"
                                                    disabled={loading}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* Email */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-500">Email Address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your@email.com"
                                            disabled={loading}
                                            required
                                            isInvalid={!!errors.email}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.email}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    {/* Username */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-500">Username</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            placeholder="Choose a username"
                                            disabled={loading}
                                            required
                                            isInvalid={!!errors.username}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.username}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    {/* Password */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-500">Password</Form.Label>
                                        <div className='position-relative'>
                                            <Form.Control 
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="At least 8 characters"
                                                disabled={loading}
                                                required
                                                isInvalid={!!errors.password}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                                                onClick={() => setShowPassword(!showPassword)}
                                                tabIndex="-1"
                                                style={{ textDecoration: 'none', fontSize: '18px' }}
                                            >
                                                {showPassword ? 'x' : '|'}
                                            </button>
                                            <Form.Control.Feedback type="invalid" style={{ display: errors.password ? 'block' : 'none' }}>
                                                {errors.password}
                                            </Form.Control.Feedback>
                                        </div>
                                        <small className="text-muted d-block mt-2">
                                            Must contain uppercase, lowercase and numbers
                                        </small> 
                                    </Form.Group>
                                    <Form.Group className='mb-3'>
                                        <Form.Label className='fw-500'>Confirm Password</Form.Label>
                                        <Form.Control 
                                            type={showPassword ? 'text' : 'password'}
                                            name="password_confirm"
                                            value={formData.password_confirm}
                                            onChange={handleChange}
                                            placeholder="Confirm your password"
                                            disabled={loading}
                                            required
                                            isInvalid={!!errors.password_confirm}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.password_confirm}
                                        </Form.Control.Feedback>
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
                                                <Spinner animation='border' size='sm' className='me-2'/>
                                                Creating account...
                                            </>
                                        ) : (
                                            'Create Account'

                                        )}
                                    </Button>
                                </Form>

                                <div className="text-center mt-4">
                                    <p className="text-muted">Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Sign In</Link></p>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default RegistrationPage
