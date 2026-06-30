import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
  });

  return {
    authUser: data?.user ?? null,
    isLoading: isLoading || isFetching,
    isAuthenticated: !!data?.user,
  };
};
export default useAuthUser;
