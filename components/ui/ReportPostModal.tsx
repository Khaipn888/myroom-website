"use client";

import { Modal, Form, Checkbox, Input } from "antd";
import { useState } from "react";
import { reportPost } from "@/api/user";
import { toast } from "react-toastify";

interface ReportPostModalProps {
  visible: boolean;
  onCancel: () => void;
  postId: string;
}

const ReportPostModal = ({
  visible,
  onCancel,
  postId,
}: ReportPostModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Danh sách các lựa chọn lý do báo cáo
  const reasonOptions = [
    "Địa chỉ không chính xác",
    "Sai thông tin về: giá, diện tích, mô tả ....",
    "Ảnh không giống",
    "Trùng với tin đăng khác",
    "Không liên lạc được người đăng",
    "Tin mạo danh",
    "Phòng đã cho thuê",
  ];

  const handleOk = async () => {
    try {
      // Validate các trường trong form
      const values = await form.validateFields();
      setSubmitting(true);
      const payload = {
        postId,
        reasons: values.reportReasons, // mảng các options đã check
        otherReason: values.otherReason || "", // phần nhập tay (nếu có)
      };

      await reportPost(payload);

      toast.success("Báo cáo đã được gửi thành công.");
      form.resetFields();
      onCancel();
    } catch (err: any) {
      // Nếu error xuất phát từ validate (chưa chọn lý do), thì không làm gì thêm
      if (err.errorFields) {
        return;
      }
      toast.error(err.error || "Có lỗi khi gửi báo cáo. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Báo cáo tin đăng"
      open={visible}
      onOk={handleOk}
      style={{
        maxWidth: 400
      }}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      confirmLoading={submitting}
      okText="Gửi"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        {/* Mục chọn lý do bằng Checkbox.Group */}
        <Form.Item
          name="reportReasons"
          label="Chọn lý do báo cáo"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn ít nhất một lý do",
            },
          ]}
        >
          <Checkbox.Group
            options={reasonOptions}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          />
        </Form.Item>

        {/* Nếu muốn nhập lý do khác, không bắt buộc */}
        <Form.Item name="otherReason" label="Lý do khác (nếu có)">
          <Input.TextArea
            rows={3}
            placeholder="Nếu chọn ‘Lý do khác’, vui lòng mô tả thêm..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReportPostModal;
