import axiosInstance from "./axiosInstance";
import { cleanParams } from "@/utils/cleanParams";

export const createPost = async (data: any) => {
  try {
    const res = await axiosInstance.post("/post", data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const updatePost = async (id: any, data: any) => {
  try {
    const res = await axiosInstance.post(`/post/${id}`, data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const saveDraft = async (data: any) => {
  try {
    const res = await axiosInstance.post("/post/save-draft", data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const getAllPosts = async (data: any) => {
  try {
    const cleanedParams = cleanParams(data);
    const res = await axiosInstance.get("/post/search-es", {
      params: cleanedParams,
      paramsSerializer: {
        // để hỗ trợ serialize array (utilities=wifi&utilities=parking)
        indexes: null,
      },
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const getSearchSuggestions = async (data: any) => {
  try {
    const cleanedParams = cleanParams(data);
    const res = await axiosInstance.get("/post/suggestions", {
      params: cleanedParams,
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const getDetailPost = async (id: string) => {
  try {
    const res = await axiosInstance.get(`post/${id}`);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const getMyDetailPost = async (id: string) => {
  try {
    const res = await axiosInstance.get(`post/my-post/${id}`);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const getSimilarPosts = async (id: string) => {
  try {
    const res = await axiosInstance.get(`post/similar/${id}`);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const updateStatusPost = async (data: any) => {
  try {
    const res = await axiosInstance.post("/post/update-status", data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const deletePost = async (id: string) => {
  try {
    const res = await axiosInstance.delete(`/post/${id}`);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};
