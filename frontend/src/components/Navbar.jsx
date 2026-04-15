import { LogOutIcon, User } from "lucide-react";
import useLogout from "../hooks/useLogout";
import useAuthUser from "../hooks/useAuthUser";
import { useNavigate } from "react-router";

const Navbar = () => {

  const { logoutMutation } = useLogout();
  const { authUser, isLoading } = useAuthUser();
  const navigate = useNavigate();

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full">

          {/* Username - click to go to the Profile */}
          {!isLoading && authUser && (
            <button
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-base-300/50 border border-base-300 hover:bg-base-300 transition"
              onClick={() => navigate("/profile")}
            >
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-base-content">
                  {authUser.displayName || authUser.userName}
              </span>
            </button>
          )}

          {/* Logout button */}
          <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
            <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;