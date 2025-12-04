import { Link, useLocation } from "react-router";
import { History, FileText, Hospital, Check } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <Hospital className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
            CVD Care
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/predict"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/predict" ? "btn-active" : ""
          }`}
        >
          <FileText className="size-5 text-base-content opacity-70" />
          <span>Predict</span>
        </Link>

        <Link
          to="/result"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/results" ? "btn-active" : ""
          }`}
        >
          <Check className="size-5 text-base-content opacity-70" />
          <span>Results</span>
        </Link>

        <Link
          to="/history"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/history" ? "btn-active" : ""
          }`}
        >
          <History className="size-5 text-base-content opacity-70" />
          <span>History</span>
        </Link>
      </nav>

    </aside>
  );
};
export default Sidebar;