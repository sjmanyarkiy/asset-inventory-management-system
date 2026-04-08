import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../features/categories/categorySlice";

export default function CategoriesPage() {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading) return <p>Loading categories...</p>;

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Asset Categories</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
          </tr>
        </thead>

        <tbody>
          {data && data.length > 0 ? (
            data.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.category_code}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">No categories found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}