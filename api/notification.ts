import { cleanParams } from "@/utils/cleanParams";
import axiosInstance from "./axiosInstance";

export const getAllNotifications = async (data: any) => {
  try {
    const cleanedParams = cleanParams(data);
    const res = await axiosInstance.get(
      "/notifications/get-all-notifications",
      {
        params: cleanedParams,
      }
    );
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const readNotification = async (id: string) => {
  try {
    const res = await axiosInstance.put(`/notifications/${id}`);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};
