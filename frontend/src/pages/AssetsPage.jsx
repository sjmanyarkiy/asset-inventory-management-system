import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssets } from "../features/assetManagement/assetSlice";

export default function AssetsPage() {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector((state) => state.assets);

  useEffect(() => {
    dispatch(fetchAssets());
  }, [dispatch]);

  if (loading) return <p>Loading assets...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Assets</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Status</th>
            <th>Assigned To</th>
          </tr>
        </thead>

        <tbody>
          {data && data.length > 0 ? (
            data.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.name}</td>
                <td>{asset.category?.name || "N/A"}</td>
                <td>{asset.status || "N/A"}</td>
                <td>{asset.assigned_to?.name || "Unassigned"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No assets found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
