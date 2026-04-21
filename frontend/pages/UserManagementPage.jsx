import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Badge, Spinner, Alert } from "react-bootstrap";
import axios from "../src/api/axios";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/users", {
        params: { page, per_page: 10 }
      });
      setUsers(res.data.users || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get("/api/roles");
      setRoles(res.data || []);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role?.id || "");
    setShowModal(true);
  };

  const assignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    setAssigning(true);
    setError("");

    try {
      const res = await axios.post(
        `/api/users/${selectedUser.id}/assign-role`,
        { role_id: parseInt(selectedRole) }
      );

      // Update user in list
      setUsers(prev =>
        prev.map(u => u.id === selectedUser.id ? res.data.user : u)
      );
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to assign role");
    } finally {
      setAssigning(false);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const res = await axios.patch(
        `/api/users/${user.id}/toggle-status`
      );

      setUsers(prev =>
        prev.map(u => u.id === user.id ? res.data.user : u)
      );
    } catch (err) {
      setError(err.response?.data?.error || "Failed to toggle user status");
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      "Super Admin": "danger",
      "Admin": "warning",
      "Manager": "info",
      "Employee": "secondary"
    };
    return <Badge bg={colors[role?.name] || "dark"}>{role?.name}</Badge>;
  };

  if (loading) return <div className="text-center py-5"><Spinner /> Loading...</div>;

  return (
    <div className="p-4">
      <h2>User Management</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="table-responsive">
        <Table striped hover>
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Email Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.first_name} {user.last_name}</td>
                <td>{user.email}</td>
                <td>{user.username}</td>
                <td>{getRoleBadge(user.role)}</td>
                <td>
                  <Badge bg={user.is_active ? "success" : "danger"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td>
                  <Badge bg={user.is_email_verified ? "success" : "warning"}>
                    {user.is_email_verified ? "Verified" : "Pending"}
                  </Badge>
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => openRoleModal(user)}
                    className="me-2"
                  >
                    Assign Role
                  </Button>
                  <Button
                    size="sm"
                    variant={user.is_active ? "outline-danger" : "outline-success"}
                    onClick={() => toggleUserStatus(user)}
                  >
                    {user.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between mt-3">
        <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
          Previous
        </Button>
        <span>Page {page} of {totalPages}</span>
        <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
          Next
        </Button>
      </div>

      {/* Role Assignment Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Assign Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form>
              <Form.Group>
                <Form.Label>User: {selectedUser.first_name} {selectedUser.last_name}</Form.Label>
              </Form.Group>
              <Form.Group>
                <Form.Label>Select Role</Form.Label>
                <Form.Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="">-- Choose Role --</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name} - Level {role.hierarchy_level}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={assignRole}
            disabled={assigning || !selectedRole}
          >
            {assigning ? "Assigning..." : "Assign"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}