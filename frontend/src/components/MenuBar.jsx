import React from "react";
import { Nav } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "../../redux/slices/authSlice";

import { Home, BarChart3, Users, LogOut } from "lucide-react";

function MenuBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  // SAFE ROLE EXTRACTION (fixes admin disappearing issue)
  // const role =
  //   user?.role?.name?.toUpperCase() ||
  //   user?.role_name?.toUpperCase() ||
  //   user?.role?.toUpperCase() ||
  //   "";

  const role = user?.role.name;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuConfig = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home size={18} />,
      roles: ["Super Admin", "Admin", "Employee", "Manager"],
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChart3 size={18} />,
      roles: ["Super Admin", "Admin", "Manager"],
    },
    {
      name: "User Management",
      path: "/admin/users",
      icon: <Users size={18} />,
      roles: ["Super Admin", "Admin"],
    },
  ];

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
          .filter((item) =>
            item.roles.includes(role)
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
      <div className="mt-auto pt-3 border-top border-light border-opacity-25">
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