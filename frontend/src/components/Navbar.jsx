import { LogOutIcon, User } from "lucide-react";
import useLogout from "../hooks/useLogout";
import useAuthUser from "../hooks/useAuthUser";

const Navbar = () => {

  const { logoutMutation } = useLogout();
  const { authUser, isLoading } = useAuthUser();

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full">

          {/* Username */}
          {!isLoading && authUser && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-base-300/50 border border-base-300">
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-base-content">
                {authUser.userName}
              </span>
            </div>
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