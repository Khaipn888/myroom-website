import axiosInstance from "./axiosInstance";

export const getAllComments = async (postId: string) => {
  try {
    const res = await axiosInstance.get(`/comments/${postId}`);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const createComment = async (data: any) => {
  try {
    const res = await axiosInstance.post(`/comments`, data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const deleteComment = async (postId: string) => {
  try {
    const res = await axiosInstance.delete(`/comments/${postId}`);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};
