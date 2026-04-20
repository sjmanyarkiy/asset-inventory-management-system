import { useState, useEffect } from "react";

export default function DepartmentSearch({ onSearch }) {
  const [input, setInput] = useState("");

  // 🔥 LIVE SEARCH with debounce (prevents API spam)
  useEffect(() => {
    const delay = setTimeout(() => {
      onSearch(input);
    }, 400); // wait 400ms after user stops typing

    return () => clearTimeout(delay);
  }, [input, onSearch]);

  return (
    <div className="flex items-center border rounded overflow-hidden w-full md:w-80">
      {/* Input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search departments..."
        className="w-full px-3 py-2 outline-none"
      />
    </div>
  );
}