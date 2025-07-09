"use client";
import React, { useEffect } from "react";
import { Modal, Form, Radio, Input, DatePicker } from "antd";
import dayjs from "dayjs";

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (values: {
    type: "electric" | "rent";
    content: string;
    month: number;
    year: number;
  }) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  open,
  onClose,
  onSend,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      const today = dayjs();
      form.resetFields();
      form.setFieldsValue({
        type: "electric",
        monthYear: today,
      });
    }
  }, [open, form]);

  const handleSend = () => {
    form.validateFields().then((values) => {
      const monthYear = values.monthYear || dayjs();
      onSend({
        type: values.type,
        content: values.content,
        month: monthYear.month() + 1, // dayjs month is 0-based
        year: monthYear.year(),
      });
      form.resetFields();
    });
  };

  return (
    <Modal
      open={open}
      title="Tạo thông báo"
      onCancel={() => {
        onClose();
        form.resetFields();
      }}
      onOk={handleSend}
      okText="Gửi"
      cancelText="Huỷ"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: "electric",
          monthYear: dayjs(),
        }}
      >
        <Form.Item
          name="type"
          label="Loại thông báo"
          rules={[{ required: true, message: "Chọn loại thông báo" }]}
        >
          <Radio.Group>
            <Radio.Button value="electric">Chốt số điện nước</Radio.Button>
            <Radio.Button value="rent">Nộp tiền phòng</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="content"
          label="Nội dung thông báo"
          rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
        >
          <Input.TextArea rows={4} placeholder="Nhập nội dung thông báo..." />
        </Form.Item>
        <Form.Item
          name="monthYear"
          label="Tháng/Năm áp dụng"
          rules={[{ required: true, message: "Chọn tháng và năm" }]}
        >
          <DatePicker
            picker="month"
            style={{ width: "100%" }}
            placeholder="Chọn tháng/năm"
            format="MM/YYYY"
            allowClear={false}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NotificationModal;
