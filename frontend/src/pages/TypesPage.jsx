import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTypes } from "../features/types/typeSlice";

export default function TypesPage() {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector((state) => state.types);

  useEffect(() => {
    dispatch(fetchTypes());
  }, [dispatch]);

  if (loading) return <p>Loading asset types...</p>;

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Asset Types</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type Code</th>
            <th>Category ID</th>
            <th>Description</th>
          </tr>
        </thead>

        <tbody>
          {data && data.length > 0 ? (
            data.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.type_code}</td>
                <td>{t.category_id}</td>
                <td>{t.description || "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No asset types found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}