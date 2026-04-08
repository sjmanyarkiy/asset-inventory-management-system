import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDepartments } from "../features/departments/departmentSlice";

export default function DepartmentsPage() {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector((state) => state.departments);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Departments</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
          </tr>
        </thead>

        <tbody>
          {data && data.length > 0 ? (
            data.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.department_code}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">No departments found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
