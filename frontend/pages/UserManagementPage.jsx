import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/authSlice';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Form,
  Modal,
  Alert,
  Spinner,
  Badge,
  InputGroup,
  Pagination
} from 'react-bootstrap';
import './UserManagementPage.css';

const UserManagementPage = () => {
  const currentUser = useSelector(selectUser);
  
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchUsers(1);
  }, []);

  useEffect(() => {
    fetchUsers(1);
  }, [searchTerm, selectedRole]);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/roles`
      );
      setRoles(response.data.roles);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      setError('Failed to load roles');
    }
  };

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        per_page: perPage,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRole && { role: selectedRole })
      });

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/users?${params}`
      );

      setUsers(response.data.users);
      setTotalPages(response.data.pages);
      setCurrentPage(page);
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch users';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setSelectedRoleId(user.role_id || '');
    setShowModal(true);
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRoleId) {
      setError('Please select a role');
      return;
    }

    // Prevent changing own role
    if (selectedUser.id === currentUser.id) {
      setError('You cannot change your own role');
      return;
    }

    setAssigning(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${selectedUser.id}/assign-role`,
        { role_id: parseInt(selectedRoleId) }
      );

      // Update the user in the list
      setUsers(users.map(u => u.id === selectedUser.id ? response.data.user : u));
      setSuccess(`Role assigned successfully to ${selectedUser.username}`);
      setShowModal(false);
      setSelectedUser(null);
      setSelectedRoleId('');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to assign role';
      setError(errorMsg);
    } finally {
      setAssigning(false);
    }
  };

  const getRoleColor = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return 'secondary';
    
    switch (role.hierarchy_level) {
      case 0:
        return 'danger'; // Super admin
      case 1:
        return 'warning'; // Admin
      case 2:
        return 'info'; // Manager
      default:
        return 'secondary'; // Employee
    }
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
  };

  const handlePageChange = (page) => {
    fetchUsers(page);
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold text-primary">User Management</h2>
          <p className="text-muted">Manage users and assign roles</p>
        </Col>
      </Row>

      {/* Alerts */}
      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError('')}
          className="mb-4"
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccess('')}
          className="mb-4"
        >
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>

        <Col md={6}>
          <Form.Select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="form-select"
          >
            <option value="">All Roles</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Users Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <Spinner animation="border" variant="primary" />
              <span className="ms-2">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p>No users found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="mb-0">
                <thead className="table-light border-bottom">
                  <tr>
                    <th className="fw-600">Name</th>
                    <th className="fw-600">Email</th>
                    <th className="fw-600">Username</th>
                    <th className="fw-600">Role</th>
                    <th className="fw-600">Status</th>
                    <th className="fw-600 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-bottom">
                      <td className="py-3">
                        <div className="fw-500">
                          {user.first_name} {user.last_name}
                        </div>
                        <small className="text-muted">ID: {user.id}</small>
                      </td>
                      <td className="py-3">
                        <a href={`mailto:${user.email}`} className="text-decoration-none">
                          {user.email}
                        </a>
                      </td>
                      <td className="py-3">
                        <code className="bg-light p-1 rounded">{user.username}</code>
                      </td>
                      <td className="py-3">
                        <Badge bg={getRoleColor(user.role_id)}>
                          {getRoleName(user.role_id)}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge bg={user.is_active ? 'success' : 'secondary'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleOpenModal(user)}
                          disabled={user.id === currentUser.id}
                          title={user.id === currentUser.id ? "You cannot change your own role" : "Edit role"}
                        >
                          Edit Role
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      {/* Role Assignment Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-bottom-0">
          <Modal.Title>Assign Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <div className="mb-3">
                <p className="text-muted small mb-1">User</p>
                <p className="fw-500 mb-0">
                  {selectedUser.first_name} {selectedUser.last_name}
                </p>
                <small className="text-muted">{selectedUser.email}</small>
              </div>

              <Form.Group>
                <Form.Label className="fw-500">Select New Role</Form.Label>
                <Form.Select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                >
                  <option value="">-- Choose a role --</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name} {role.description && `- ${role.description}`}
                    </option>
                  ))}
                </Form.Select>
                {selectedRoleId && roles.find(r => r.id === parseInt(selectedRoleId)) && (
                  <div className="mt-2 p-2 bg-light rounded small">
                    <p className="mb-1 fw-500">Role Description:</p>
                    <p className="mb-0">{roles.find(r => r.id === parseInt(selectedRoleId))?.description}</p>
                  </div>
                )}
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top-0">
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={assigning}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssignRole}
            disabled={!selectedRoleId || assigning}
          >
            {assigning ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Assigning...
              </>
            ) : (
              'Assign Role'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagementPage;