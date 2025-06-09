import axiosInstance from "./axiosInstance";

export const getAllMyHostel = async () => {
  try {
    const res = await axiosInstance.get("/hostel/my-hostels");
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const createHostel = async (data: any) => {
  try {
    const res = await axiosInstance.post("/hostel", data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const updateHostel = async ({ id, data }: any) => {
  try {
    const res = await axiosInstance.post(`/hostel/${id}`, data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const deleteHostel = async (id: any) => {
  try {
    const res = await axiosInstance.delete(`/hostel/${id}`);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const getHostelDetail = async (id: any) => {
  try {
    const res = await axiosInstance.get(`/hostel/${id}`);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};