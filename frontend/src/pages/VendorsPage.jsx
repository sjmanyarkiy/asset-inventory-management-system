import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVendors } from "../features/vendors/vendorSlice";

export default function VendorsPage() {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector((state) => state.vendors);

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Vendors</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Email</th>
          </tr>
        </thead>

        <tbody>
          {data && data.length > 0 ? (
            data.map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.vendor_code}</td>
                <td>{v.email}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No vendors found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}