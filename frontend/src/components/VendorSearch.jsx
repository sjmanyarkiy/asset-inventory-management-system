import { useState } from "react";

export default function VendorSearch({ onSearch }) {
  const [input, setInput] = useState("");

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const handleSearch = () => {
    onSearch(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center border rounded overflow-hidden w-full md:w-80">
      
      {/* Input */}
      <input
        type="text"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search vendors..."
        className="w-full px-3 py-2 outline-none"
      />

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
        title="Search"
      >
        🔍
      </button>
    </div>
  );
}
