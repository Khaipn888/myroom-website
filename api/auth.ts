import axiosInstance from "./axiosInstance";

export const loginApi = async (data: { email: string; password: string }) => {
  const res = await axiosInstance.post("/auth/login", data);
  const token = res.data.accessToken;
  if (token) {
    localStorage.setItem("accessToken", token);
  }
  return res.data;
};

export const registerApi = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const res = await axiosInstance.post("/auth/register", data);
  return res.data;
};

export const logoutApi = async () => {
  await axiosInstance.post("/auth/logout"); // optional
  localStorage.removeItem("accessToken");
};

export const getMyProfile = async () => {
  const res = await axiosInstance.get("/auth/me");
  return res.data;
};

export const sendOtpApi = async (data: any) => {
  const res = await axiosInstance.post("/auth/send-otp", data);
  return res.data;
};

export const verifyOtpApi = async (data: any) => {
  const res = await axiosInstance.post("/auth/verify-otp", data);
  return res.data;
};

export const forgotPasswordApi = async (email: string) => {
  const res = await axiosInstance.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPasswordApi = async (data: any) => {
  const res = await axiosInstance.post("/auth/reset-password", data);
  return res.data;
};

export const changePassword = async (data: any) => {
  try {
    const res = await axiosInstance.post("auth/change-password", data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};