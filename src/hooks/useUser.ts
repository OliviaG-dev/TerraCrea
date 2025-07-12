import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { User } from "../types/User";

export const useUser = (userId: number) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data } = await api.get<User>(`/users/${userId}`);
      return data;
    },
  });
};
  