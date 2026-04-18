import UserProfile from "../src/components/UserProfile";


import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, updateUser } from '../redux/slices/authSlice';
import { Container, Row, Col, Card, Form, Button, Badge, Image, Alert, Spinner, Tab, Tabs } from 'react-bootstrap';
import { User, Mail, Shield, Building, Edit3, Save, Camera } from 'lucide-react';
import defaultAvatar from '../../frontend/src/assets/default-avatar.png';  // Add placeholder image

const UserProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [activeKey, setActiveKey] = useState('details');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Load form data
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        department_id: user.department_id || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
      await dispatch(updateUser(formData)).unwrap();
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const AvatarSection = () => (
    <Card className="text-center mb-4 shadow-sm">
      <Card.Body className="p-4">
        <div className="position-relative">
          <Image 
            src={user?.avatar_url || defaultAvatar} 
            width={120} 
            height={120} 
            roundedCircle 
            className="shadow-lg mb-3"
            alt="Profile"
          />
          <Button 
            size="sm" 
            variant="primary" 
            className="position-absolute bottom-0 end-0 rounded-circle"
            style={{ width: '36px', height: '36px' }}
          >
            <Camera size={16} />
          </Button>
        </div>
        <h5 className="fw-bold mb-1">
          {user?.first_name 
            ? `${user.first_name} ${user.last_name || ''}`.trim() 
            : user?.username || 'User'
          }
        </h5>
        <p className="text-muted mb-1">{user?.username}</p>
        <div className="d-flex justify-content-center gap-2 flex-wrap">
          <Badge bg="primary" className="fs-6 px-3 py-2">
            <Shield size={16} className="me-1 mb-1" />
            {user?.role?.name || 'Employee'}
          </Badge>
          {user?.department?.name && (
            <Badge bg="info" className="fs-6 px-3 py-2">
              <Building size={16} className="me-1 mb-1" />
              {user.department.name}
            </Badge>
          )}
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid className="py-4">
      <Row>
        <Col md={12} lg={8}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1">
                <User size={28} className="me-2 text-primary mb-1 d-inline" />
                My Profile
              </h2>
              <p className="text-muted mb-0">Manage your account details</p>
            </div>
            <Button 
              variant={editMode ? "success" : "primary"} 
              onClick={() => setEditMode(!editMode)}
              className="d-flex align-items-center gap-2"
            >
              {editMode ? (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit3 size={18} />
                  Edit Profile
                </>
              )}
            </Button>
          </div>

          {success && (
            <Alert variant="success" className="mb-4">
              {success}
            </Alert>
          )}

          <Tabs activeKey={activeKey} onSelect={setActiveKey} className="mb-4">
            <Tab eventKey="details" title="Profile Details">
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            <User size={18} className="me-2 text-muted mb-1 d-inline" />
                            First Name
                          </Form.Label>
                          <Form.Control
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            disabled={!editMode}
                            className="shadow-sm"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Last Name
                          </Form.Label>
                          <Form.Control
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            disabled={!editMode}
                            className="shadow-sm"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            <Mail size={18} className="me-2 text-muted mb-1 d-inline" />
                            Email
                          </Form.Label>
                          <Form.Control
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={!editMode}
                            className="shadow-sm"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Phone</Form.Label>
                          <Form.Control
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            disabled={!editMode}
                            className="shadow-sm"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {editMode && (
                      <div className="d-flex gap-2">
                        <Button 
                          type="submit" 
                          variant="primary" 
                          className="flex-grow-1"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Spinner size="sm" className="me-2" />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => {
                            setEditMode(false);
                            // Reset form
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </Form>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="security" title="Security" disabled>
              <Card className="shadow-sm border-0 mt-3">
                <Card.Body>
                  <p className="text-muted">Password change and 2FA coming soon.</p>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>

        <Col lg={4}>
          <AvatarSection />
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfilePage;