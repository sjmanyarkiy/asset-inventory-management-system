import Navbar from "../components/Navbar";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import AssetList from "../components/AssetList";

function MainDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        <MenuBar />

        <main className="flex-1 p-6">
          <SearchBar />
          <div className="mt-6">
            <AssetList />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainDashboard;