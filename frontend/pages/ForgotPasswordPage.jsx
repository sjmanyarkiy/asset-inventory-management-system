import { useState } from "react";
import { Form, Button, Alert, Container } from "react-bootstrap";
import axios from "../src/api/axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("/api/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Container className="mt-5">
        <Alert variant="success">
          <h4>Check Your Email</h4>
          <p>If an account exists with that email, you'll receive a password reset link.</p>
          <Button onClick={() => navigate("/login")}>Back to Login</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="mb-4">Forgot Password?</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading} className="w-100">
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </Form>
      <p className="text-center mt-3">
        <a href="/login">Back to Login</a>
      </p>
    </Container>
  );
}