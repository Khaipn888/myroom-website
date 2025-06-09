import axiosInstance from "./axiosInstance";

export const createInvoice = async (data: any) => {
  try {
    const res = await axiosInstance.post("/invoice", data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const getInvoiceByMonth = async (
  roomId: string,
  month: number,
  year: number
) => {
  try {
    const res = await axiosInstance.get(
      `/invoice?roomId=${roomId}&month=${month + 1}&year=${year}`
    );
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const getAllInvoiceOfRoom = async (
  roomId: string,
) => {
  try {
    const res = await axiosInstance.get(
      `/invoice/all/${roomId}`
    );
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const updateInvoiceStatus = async (id:string, data: any) => {
  try {
    const res = await axiosInstance.patch(`/invoice/${id}/status`, data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Đã có lỗi xảy ra";
  }
};

export const exportInvoicesExcel = async (
  month?: number,
  year?: number
) => {
  try {
    // Xây dựng query string nếu có month + year
    let url = "/invoice/export-xlsx-multiple";
    if (typeof month === "number" && typeof year === "number") {
      url += `?month=${month}&year=${year}`;
    }

    // Gọi API với responseType = 'blob' để lấy file Excel
    const res = await axiosInstance.get(url, {
      responseType: "blob",
    });

    // Tách filename từ header Content-Disposition (nếu có)
    let fileName = "invoices.xlsx";
    const disposition = res.headers["content-disposition"];
    if (disposition) {
      const match = disposition.match(/filename="?(.+)"?/);
      if (match && match[1]) {
        fileName = match[1];
      }
    }

    // Tạo URL tạm và gợi download
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error: any) {
    // Ném ra cho component xử lý
    throw error.response?.data || error.message || "Tải file thất bại";
  }
};