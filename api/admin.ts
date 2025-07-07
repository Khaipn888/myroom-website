import { cleanParams } from "@/utils/cleanParams";
import axiosInstance from "./axiosInstance";

export const getAllPosts = async (data: any) => {
  try {
    const cleanedParams = cleanParams(data);
    const res = await axiosInstance.get("/user/get-all-posts", {
      params: cleanedParams,
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const getAllPostSearchSuggestions = async (data: any) => {
  try {
    const cleanedParams = cleanParams(data);
    const res = await axiosInstance.get("/user/get-all-post-suggestions", {
      params: cleanedParams,
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const getAllUsers = async (data: any) => {
  try {
    const cleanedParams = cleanParams(data);
    const res = await axiosInstance.get("/user/get-all-users", {
      params: cleanedParams,
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const getAllUserSearchSuggestions = async (data: any) => {
  try {
    const cleanedParams = cleanParams(data);
    const res = await axiosInstance.get("/user/get-suggest-users", {
      params: cleanedParams,
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const lockUser = async (data: any) => {
  try {
    const res = await axiosInstance.post("/user/lock", data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const unlockUser = async (data: any) => {
  try {
    const res = await axiosInstance.post("/user/unlock", data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};