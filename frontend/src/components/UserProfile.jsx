import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, updateUser } from '../../redux/slices/authSlice';
import { Modal, Form, Button, Badge, Image, OverlayTrigger, Tooltip, Spinner } from 'react-bootstrap';
import { User, Mail, Shield, Building, Edit3, Save, Camera, Phone } from 'lucide-react';

const UserProfile = ({ fullPage = false }) => {  // fullPage prop for page vs sidebar
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '' });
  const [saving, setSaving] = useState(false);

  const displayName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || 'User';

  const handleEditOpen = () => {
    setEditForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || ''
    });
    setShowEdit(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateUser(editForm)).unwrap();
      setShowEdit(false);
    } catch (err) {
      console.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6c757d&color=fff&size=${fullPage ? 120 : 48}`;

  return (
    <>
      {/* Profile Card */}
      <div className={`user-profile-card ${fullPage ? 'p-4 shadow-lg border-0' : 'p-3 border rounded'}`}>
        <div className={`d-flex align-items-center gap-3 ${fullPage ? 'mb-4 pb-4 border-bottom' : ''}`}>
          <Image 
            src={avatarSrc} 
            width={fullPage ? 80 : 48} 
            height={fullPage ? 80 : 48} 
            roundedCircle 
            className={`shadow ${fullPage ? 'shadow-lg' : 'shadow-sm'}`}
            alt="Profile"
          />
          
          <div className={fullPage ? 'flex-grow-1' : ''}>
            <div className={`fw-bold ${fullPage ? 'fs-4 mb-1' : ''}`}>
              {displayName}
            </div>
            {!fullPage && (
              <div className="small text-white text-muted mb-1">@{user?.username}</div>
            )}
            {/* <div className="small text-muted">{user?.email}</div> */}
            
            {/* Badges */}
            <div className={`mt-2 ${fullPage ? 'd-flex gap-2 flex-wrap mt-3' : 'd-flex gap-1 mt-1'}`}>
              <Badge bg="primary" className={`px-2 py-1 ${fullPage ? 'fs-6' : 'fs-xxsmall'}`}>
                <Shield size={fullPage ? 16 : 12} className="me-1" />
                {user?.role?.name || 'Employee'}
              </Badge>
              {user?.department?.name && (
                <Badge bg="info" className={`px-2 py-1 ${fullPage ? 'fs-6' : 'fs-xxsmall'}`}>
                  <Building size={fullPage ? 16 : 12} className="me-1" />
                  {user.department.name}
                </Badge>
              )}
            </div>
          </div>
          
          {fullPage && (
            <OverlayTrigger placement="top" overlay={<Tooltip>Edit Profile</Tooltip>}>
              <Button 
                size="sm" 
                variant="outline-primary" 
                className="rounded-circle p-2"
                onClick={handleEditOpen}
              >
                <Edit3 size={18} />
              </Button>
            </OverlayTrigger>
          )}
        </div>

        {/* Full page: Additional info */}
        {fullPage && (
          <div className="row g-3 mt-3">
            <div className="col-6">
              <div className="small text-muted">
                <Mail size={14} className="me-1" />
                {user?.email}
              </div>
            </div>
            {user?.phone && (
              <div className="col-6">
                <div className="small text-muted">
                  <Phone size={14} className="me-1" />
                  {user.phone}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered size="md">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">
            <Edit3 size={20} className="me-2 text-primary mb-1 d-inline" />
            Edit Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-muted mb-1">First Name</Form.Label>
              <Form.Control 
                value={editForm.first_name}
                onChange={e => setEditForm({...editForm, first_name: e.target.value})}
                className="shadow-sm border-primary-subtle"
                placeholder="Enter first name"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold small text-muted mb-1">Last Name</Form.Label>
              <Form.Control 
                value={editForm.last_name}
                onChange={e => setEditForm({...editForm, last_name: e.target.value})}
                className="shadow-sm border-primary-subtle"
                placeholder="Enter last name"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light border-0 pt-0">
          <Button 
            variant="secondary" 
            onClick={() => setShowEdit(false)}
            disabled={saving}
            className="px-4"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="px-4 fw-semibold"
          >
            {saving ? (
              <>
                <Spinner size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserProfile;