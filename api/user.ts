import { cleanParams } from "@/utils/cleanParams";
import axiosInstance from "./axiosInstance";

export const savePost = async (data: any) => {
  try {
    const res = await axiosInstance.post("/user/save-post", data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const unsavePost = async (data: any) => {
  try {
    const res = await axiosInstance.post("/user/unsave-post", data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const getAllMyPosts = async (data: any) => {
  try {
    const cleanedParams = cleanParams(data);
    const res = await axiosInstance.get("/user/get-my-posts", {
      params: cleanedParams,
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const getMySavedPosts = async (data: any) => {
  try {
    const cleanedParams = cleanParams(data);
    const res = await axiosInstance.get("/user/saved-posts", {
      params: cleanedParams,
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};


export const getSearchSuggestions = async (data: any) => {
  try {
    const cleanedParams = cleanParams(data);
    const res = await axiosInstance.get("/user/get-my-post-suggestions", {
      params: cleanedParams,
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const updateMe = async (data: any) => {
  try {
    const res = await axiosInstance.post("/user/update-me", data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const reportPost = async (data: any) => {
  try {
    const res = await axiosInstance.post("/report", data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};