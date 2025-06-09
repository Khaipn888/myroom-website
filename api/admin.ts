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