import React from "react";
import { Modal } from "antd";

const BillDetailModal = ({ bill, onClose }: { bill: any, onClose: () => void }) => {
  if (!bill) return null;

  return (
    <Modal open={!!bill} onCancel={onClose} onOk={onClose} title="Chi tiết hóa đơn">
      <p>Phòng: {bill.roomName}</p>
      <p>Tháng/Năm: {bill.monthYear}</p>
      <p>Ngày đóng: {bill.paidDate}</p>
      <p>Số tiền: {bill.amount}</p>
      <p>Tình trạng: {bill.status}</p>
      <p>Số tiền nợ: {bill.debt}</p>
      <p>Ghi chú: {bill.note}</p>
    </Modal>
  );
};

export default BillDetailModal;
