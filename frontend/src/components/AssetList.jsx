const AssetList = ({ assets, loading, onEdit, onDelete }) => {
  return (
    <div className="mt-4">
      <table border="1" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Name</th>
            <th>Code</th>
            <th>Barcode</th>
            <th>Category</th>
            <th>Type</th>
            <th>Vendor</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="10">Loading...</td>
            </tr>
          ) : assets.length === 0 ? (
            <tr>
              <td colSpan="10">No assets found</td>
            </tr>
          ) : (
            assets.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>

                <td>
                  {a.image_url || a.image_file ? (
                    <img
                      src={`http://127.0.0.1:5000/${a.image_file || a.image_url}`}
                      alt=""
                      width="50"
                    />
                  ) : (
                    "No Image"
                  )}
                </td>

                <td>{a.name}</td>
                <td>{a.asset_code}</td>
                <td>{a.barcode}</td>

                {/* ✅ FROM BACKEND to_dict() */}
                <td>{a.category || "—"}</td>
                <td>{a.asset_type || "—"}</td>
                <td>{a.vendor || "—"}</td>
                <td>{a.department || "—"}</td>

                <td>
                  <button onClick={() => onEdit(a)}>Edit</button>

                  <button
                    onClick={() => onDelete(a.id)}
                    style={{ marginLeft: 8, color: "red" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssetList;