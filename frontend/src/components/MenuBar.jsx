import React from "react";
import { Nav } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/slices/authSlice";


function MenuBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const role = user?.role.name?.toUpperCase();;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuConfig = [
  {
    name: "Dashboard",
    path: "/dashboard",
    roles: ["ADMIN", "EMPLOYEE", "PROCUREMENT"]
  },
  {
    name: "Reports",
    path: "/reports",
    roles: ["ADMIN", "PROCUREMENT", "FINANCE"]
  },
  {
    name: "User Management",
    path: "/admin/users",
    roles: ["ADMIN"]
  }
];

console.log("USER:", user);
console.log("ROLE:", role);

  return (
    <div
      className="bg-primary text-white d-flex flex-column p-3"
      style={{ height: "100vh", width: "250px", position: "sticky", top: 0 }}
    >
      <h5 className="fw-bold mb-4">Asset Inventory</h5>

      <Nav className="flex-column gap-2">
        {menuConfig
          .filter(item => item.roles.includes(role))
          .map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "nav-link bg-light text-primary fw-bold rounded"
                  : "nav-link text-white"
              }
            >
              {item.name}
            </NavLink>
          ))}
      </Nav>

      <div className="mt-auto">
        <button className="btn btn-light w-100" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default MenuBar;