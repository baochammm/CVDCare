import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});

axiosInstance.interceptors.response.use(
  // Trường hợp thành công -> trả về response bình thường
  (response) => response,

  // Trường hợp lỗi
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url;

    // Chỉ redirect khi:
    // 1. Token hết hạn (401)
    // 2. Không phải request từ /auth/me (để tránh redirect khi app khởi động và check login status)
    // 3. Không phải request login/signup (tránh redirect vòng lặp)
    const isAuthRoute =
      requestUrl?.includes("/auth/login") ||
      requestUrl?.includes("/auth/signup") ||
      requestUrl?.includes("/auth/me");

    if (status === 401 && !isAuthRoute) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);
