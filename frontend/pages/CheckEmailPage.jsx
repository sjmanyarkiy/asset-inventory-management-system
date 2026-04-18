import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../redux/slices/authSlice';
import { Container, Alert, Spinner } from 'react-bootstrap';

const CheckEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = searchParams.get('token');

    useEffect(() => {
        if (token) {
            verifyEmail(token);
        }
    }, [token]);

    const verifyEmail = async (token) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/verify-email/${token}`
            );
            const { user, access_token: token } = response.data.data;
            dispatch(setUser(user));
            dispatch(setToken(token));
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            navigate('/dashboard');
        } catch (err) {
            // Handle error - show resend option
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center min-vh-100">
            <div className="text-center">
                {token ? (
                    <>
                        <Spinner animation="border" className="mb-3" />
                        <h4>Verifying your email...</h4>
                    </>
                ) : (
                    <>
                        <Alert variant="info">
                            <h4>Check your email</h4>
                            <p>We've sent a verification link to your email. Click it to complete registration.</p>
                            <p>Didn't receive it? Check spam or <button onClick={() => navigate('/login')}>resend later</button>.</p>
                        </Alert>
                    </>
                )}
            </div>
        </Container>
    );
};