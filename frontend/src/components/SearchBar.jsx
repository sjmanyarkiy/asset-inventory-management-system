function SearchBar() {
  return (
    <div className="flex gap-4">
      <input
        type="text"
        placeholder="Search assets..."
        className="flex-1 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
        Search
      </button>
    </div>
  );
}

export default SearchBar;