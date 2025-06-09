import axiosInstance from "./axiosInstance";

export const getAllMyRooms = async () => {
  try {
    const res = await axiosInstance.get("/hostel/my-hostels");
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const createRoom = async (data: any) => {
  try {
    const res = await axiosInstance.post("/room", data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const updateRoom = async ({ id, data }: any) => {
  try {
    const res = await axiosInstance.post(`/room/${id}`, data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const deleteRoom = async (id: any, hostelId: any) => {
  try {
    const res = await axiosInstance.delete(`/room/${id}?hostelId=${hostelId}`);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const getRoomsDetail = async (id: any) => {
  try {
    const res = await axiosInstance.get(`/room/${id}`);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const addMember = async (data: any) => {
  try {
    const res = await axiosInstance.post("/room/add-member", data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const updateMember = async (id: string, data: any) => {
  try {
    const res = await axiosInstance.post(`/room/member/${id}`, data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const deleteMember = async (
  id: string,
  roomId: string,
  hostelId: string
) => {
  try {
    const res = await axiosInstance.delete(
      `/room/member/${id}?roomId=${roomId}&hostelId=${hostelId}`
    );
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};
