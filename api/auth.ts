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

export const sendOtpApi = async (data:any) => {
  const res = await axiosInstance.post("/auth/send-otp", data);
  return res.data;
};

export const verifyOtpApi = async (data:any) => {
  const res = await axiosInstance.post("/auth/verify-otp", data);
  return res.data;
};
