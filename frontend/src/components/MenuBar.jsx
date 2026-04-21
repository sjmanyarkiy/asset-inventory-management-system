import React from "react";
import { Nav, Dropdown } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "../../redux/slices/authSlice";
import UserProfile from "../components/UserProfile";

import { Home, BarChart3, Users, LogOut, User, CheckSquare, Shield, Cog, WalletCards  } from "lucide-react";
// import { CheckSquare, Shield } from 'react-feather';

function MenuBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const normalize = (v) => (v || "").toString().trim().toLowerCase();

  // SAFE ROLE EXTRACTION (fixes admin disappearing issue)
  // const role =
  //   user?.role?.name?.toUpperCase() ||
  //   user?.role_name?.toUpperCase() ||
  //   user?.role?.toUpperCase() ||
  //   "";

  // const role = user?.role.name;
  // const role =
  //   user?.role?.name ||
  //   user?.role_name ||
  //   user?.role ||
  //   "";
  const role =
    (user?.role?.name ||
    user?.role_name ||
    user?.role ||
    "")
    .toString()
    .trim()
    .toLowerCase();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuConfig = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home size={18} />,
      roles: ["super admin", "admin", "employee", "manager"],
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChart3 size={18} />,
      roles: ["super admin", "admin", "manager"],
    },
    {
      name: "User Management",
      path: "/admin/users",
      icon: <Users size={18} />,
      roles: ["super admin", "admin"],
    },
    {
      name: "Assets",
      path: "/assets",
      icon: <Home size={18} />,
      roles: ["super admin", "admin", "manager"]
    },
    {
      name: "Vendors",
      path: "/vendors",
      icon: <Users size={18} />,
      roles: ["super admin", "admin", "manager"]
    },
    {
      name: "Categories",
      path: "/categories",
      icon: <BarChart3 size={18} />,
      roles: ["super admin", "admin", "manager"]
    },
    {
      name: "Departments",
      path: "/departments",
      icon: <Users size={18} />,
      roles: ["super admin", "admin", "manager"]
    },
    {
      name: "Asset Requests",
      path: "/requests",
      icon: <WalletCards size={18} />,
      roles: ["super admin", "admin", "employee", "manager"]
    },
    {
      name: "Repair Requests",
      path: "/repair-requests",
      icon: <Cog size={18} />,
      roles: ["super admin", "admin", "employee", "manager"]
    },
    {
      name: "Request Approvals",
      path: "/approvals",
      icon: <CheckSquare size={18} />,
      roles: ["super admin", "manager"],  // Only managers and admins see this
      divider: true
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User size={18} />,
      roles: ["super admin", "admin", "employee", "manager"]
    },
    {
      name: "Admin Panel",
      path: "/admin",
      icon: <Shield size={18} />,
      roles: ["super admin", "admin"]
    },
  ];

  console.log("USER:", user);
  console.log("ROLE RAW:", user?.role);
  console.log("ROLE NORMALIZED:", role);
  console.log("MENU ROLES:", menuConfig.map(m => m.roles));

  return (
    <div
      className="d-flex flex-column shadow-sm"
      style={{
        height: "100vh",
        width: "260px",
        position: "sticky",
        top: 0,
        background: "linear-gradient(180deg, #0d6efd, #0b5ed7)",
        color: "white",
        padding: "20px",
      }}
    >
      {/* HEADER */}
      <div className="mb-4">
        <h5 className="fw-bold mb-1">Asset Inventory</h5>
        <small className="text-light opacity-75">
          Management System
        </small>
      </div>

      {/* MENU */}
      <Nav className="flex-column gap-2">
        {menuConfig
          // .filter((item) =>
          //   item.roles.includes(role)
          // )
          .filter(item =>
            item.roles?.some(r => normalize(r) === role)
          )
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `d-flex align-items-center gap-2 px-3 py-2 rounded text-decoration-none ${
                  isActive
                    ? "bg-white text-primary fw-semibold shadow-sm"
                    : "text-white opacity-75 hover-item"
                }`
              }
              style={{ fontSize: "14px" }}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
      </Nav>

      {/* FOOTER */}
      {/* <div className="mt-auto pt-3 border-top border-light border-opacity-25">
        <div className="mb-2 small opacity-75">
          Signed in as <br />
          <strong>{user?.email || "User"}</strong>
        </div>

        <button
          className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div> */}
      <div className="mt-auto pt-3 border-top border-light border-opacity-25">
        <div className="mb-3">
          <UserProfile />  {/* NEW: Inline profile with avatar/role */}
        </div>
        
        <Dropdown className="w-100">
          <Dropdown.Toggle 
            variant="light" 
            className="w-100 text-start d-flex align-items-center gap-2 py-2"
          >
            <User size={16} />
            Manage Account
          </Dropdown.Toggle>
          
          <Dropdown.Menu className="w-100">
            <Dropdown.Item as={NavLink} to="/profile">
              <User size={16} className="me-2" /> View Profile
            </Dropdown.Item>
            <Dropdown.Item onClick={handleLogout}>
              <LogOut size={16} className="me-2" /> Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* hover styling */}
      <style>
        {`
          .hover-item:hover {
            background: rgba(255,255,255,0.15);
          }
        `}
      </style>
    </div>
  );
}

export default MenuBar;