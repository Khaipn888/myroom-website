"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, DatePicker } from "antd";
import {} from "@ant-design/icons";
import dayjs from "dayjs";

interface Service {
  name: string;
  price: number;
  unit: string;
}

interface RoomFormModalProps {
  visible: boolean;
  room: Partial<{
    name: string;
    price: number;
    area: number;
    rentDate: Date;
    electricityPrice: number;
    waterPrice: number;
    services: Service[];
  }> | null;
  onClose: () => void;
  onSave: (values: {
    name: string;
    price: number;
    area: number;
    electricityPrice: number;
    waterPrice: number;
    services: Service[];
  }) => void;
}

const RoomFormModal: React.FC<RoomFormModalProps> = ({
  visible,
  room,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        name: room?.name || "",
        price: room?.price ?? undefined,
        area: room?.area ?? undefined,
        rentDate: dayjs(room?.rentDate) ?? undefined,
      });
    }
  }, [visible, room, form]);

  const handleOk = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
    onSave(values);
    form.resetFields();
  };

  return (
    <Modal
      open={visible}
      title={room ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleOk}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên phòng"
          rules={[{ required: true, message: "Vui lòng nhập tên phòng" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="price"
          label="Giá thuê (đồng)"
          rules={[{ required: true, message: "Vui lòng nhập giá thuê" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item
          name="area"
          label="Diện tích (m²)"
          rules={[{ required: true, message: "Vui lòng nhập diện tích" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item
          name="rentDate"
          label="Ngày thuê phòng"
          rules={[{ required: true, message: "Vui lòng chọn ngày thuê phòng" }]}
        >
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" placeholder="Ngày thuê phòng"/>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoomFormModal;
