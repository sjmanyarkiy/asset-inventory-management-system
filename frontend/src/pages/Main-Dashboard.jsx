import React, { useState } from "react";
import Navbar from "../components/Navbar";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import AssetList from "../components/AssetList";

function MainDashboard() {
  const [searchTerm, setSearchTerm] = useState(""); // 👈 add this

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        <MenuBar />

        <main className="flex-1 p-6">
          <SearchBar onSearch={setSearchTerm} /> {/* 👈 pass setter */}

          <div className="mt-6">
            <AssetList searchTerm={searchTerm} /> {/* 👈 pass term */}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainDashboard;