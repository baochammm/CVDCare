import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const predictHealth = (inputData) =>
  axiosInstance.post("/predict", inputData);

export const getMyHistory = () => axiosInstance.get("/history/my-history");

export const getAllUsers = () => axiosInstance.get("/admin/users");

export const deleteUser = (userId) =>
  axiosInstance.delete(`/admin/users/${userId}`);

export const getUserHealthData = (userId) =>
  axiosInstance.get(`/admin/users/${userId}/health-data`);

export const deleteHealthData = (id) =>
  axiosInstance.delete(`/admin/health-data/${id}`);

export const updateHealthData = (id, updatedData) =>
  axiosInstance.put(`/admin/health-data/${id}`, updatedData);
