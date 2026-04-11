import { NavLink } from "react-router-dom";

function MenuBar() {
  return (
    <aside className="w-64 min-h-screen bg-white shadow-md p-6">
      {/* <ul className="space-y-4">
        <li className="hover:text-blue-600 cursor-pointer font-medium">
          Dashboard
        </li>
        <li className="hover:text-blue-600 cursor-pointer font-medium">
          Assets
        </li>
        <li className="hover:text-blue-600 cursor-pointer font-medium">
          Reports
        </li>
        <li className="hover:text-blue-600 cursor-pointer font-medium">
          Users
        </li>
      </ul> */}
      <NavLink to="/dashboard" className="nav-link">
        Dashboard
      </NavLink>

      <NavLink to="/reports" className="nav-link">
        Reports
      </NavLink>
    </aside>
  );
}

export default MenuBar;