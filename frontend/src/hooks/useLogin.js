import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";
import { useNavigate } from "react-router-dom";

const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      // Refetch auth user
      const { data } = await queryClient.fetchQuery({
        queryKey: ["authUser"],
      });

      const user = data?.user;

      if (user?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/predict", { replace: true });
      }
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;
