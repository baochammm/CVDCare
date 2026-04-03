import Sidebar from "./SideBar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  return (
    <div className="min-h-screen flex flex-col pb-8" data-theme="corporate">
      <div className="flex flex-1">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col">
          <Navbar />

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-primary text-primary-content text-center text-sm py-4 px-6 mt-auto">
        © 2026 Cardiovascular Disease Prediction. All rights reserved.
      </footer>
    </div>
  );
};
export default Layout;