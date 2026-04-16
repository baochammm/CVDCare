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

export const getProfile = () => axiosInstance.get("/user/profile");

export const updateProfile = (data) => axiosInstance.put("/user/profile", data);

export const changePassword = (data) =>
  axiosInstance.put("/user/change-password", data);

export const deleteAccount = (data) =>
  axiosInstance.delete("/user/account", { data });

export const predictHealth = (inputData) =>
  axiosInstance.post("/predict", inputData);

export const getMyHistory = () => axiosInstance.get("/history/my-history");

export const getLatestPrediction = () => axiosInstance.get("/history/latest");

export const deleteHealthData = (id) => axiosInstance.delete(`/history/${id}`);

export const updateHealthData = (id, data) =>
  axiosInstance.put(`/history/${id}`, data);

export const getAllUsers = () => axiosInstance.get("/admin/users");

export const deleteUser = (userId) =>
  axiosInstance.delete(`/admin/users/${userId}`);

export const getUserHealthData = (userId) =>
  axiosInstance.get(`/admin/users/${userId}/health-data`);

export const restoreHealthData = (id) =>
  axiosInstance.patch(`/admin/health-data/${id}/restore`);

export const createRequest = (message) =>
  axiosInstance.post("/support", { message });

export const getMyRequests = () => axiosInstance.get("/support/my");

export const deleteRequest = (id) => axiosInstance.delete(`/support/${id}`);

export const getAllRequests = () => axiosInstance.get("/support/admin/all");

export const updateRequestStatus = (id, status) =>
  axiosInstance.patch(`/support/admin/${id}/status`, { status });
