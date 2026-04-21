import { useState } from "react";

export default function DepartmentSearch({ onSearch }) {
  const [input, setInput] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    onSearch(value); // pass value up immediately
  };

  return (
    <div className="flex items-center border rounded overflow-hidden w-full md:w-80">
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Search departments..."
        className="w-full px-3 py-2 outline-none"
      />
    </div>
  );
}