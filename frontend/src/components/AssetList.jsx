function AssetList() {
  const assets = [
    { id: 1, name: "Laptop", category: "IT", status: "Assigned" },
    { id: 2, name: "Printer", category: "Office", status: "Available" },
    { id: 3, name: "Monitor", category: "IT", status: "Repair" },
    { id: 4, name: "Camera", category: "Media", status: "Assigned" },
    { id: 5, name: "Microphone", category: "Media", status: "Available" },
    { id: 6, name: "Video Recorder", category: "Media", status: "Assigned" },
    { id: 7, name: "Projector", category: "Media", status: "Repair" },
    { id: 8, name: "Accounting Laptop", category: "Finance", status: "Assigned" },
    { id: 9, name: "Receipt Printer", category: "Finance", status: "Available" },
    { id: 10, name: "Calculator", category: "Finance", status: "Assigned" },
    { id: 11, name: "Cash Drawer", category: "Finance", status: "Available" },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case "Available":
        return "text-green-600 font-semibold";
      case "Assigned":
        return "text-blue-600 font-semibold";
      case "Repair":
        return "text-red-600 font-semibold";
      default:
        return "";
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-2xl font-bold mb-4">Asset List</h3>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 border text-left">ID</th>
            <th className="p-3 border text-left">Asset Name</th>
            <th className="p-3 border text-left">Category</th>
            <th className="p-3 border text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id} className="hover:bg-gray-50">
              <td className="p-3 border">{asset.id}</td>
              <td className="p-3 border">{asset.name}</td>
              <td className="p-3 border">{asset.category}</td>
              <td className={`p-3 border ${getStatusClass(asset.status)}`}>
                {asset.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AssetList;