import { Navigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";

export default function AdminRoute({ children }) {
  const { authUser, isLoading } = useAuthUser();

  if (isLoading) return null;

  if (!authUser || authUser.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
}