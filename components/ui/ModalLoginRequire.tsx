// components/ModalLoginRequire.tsx
import React from "react";
import { Modal, Button, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

interface ModalLoginRequireProps {
  visible: boolean;
  onCancel: () => void;
}

const ModalLoginRequire: React.FC<ModalLoginRequireProps> = ({
  visible,
  onCancel,
}) => {
  const router = useRouter();
  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      styles={{
        body: {
          padding: "24px",
          textAlign: "center",
        },
        mask: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
      }}
      width={360}
      closable={false} // tắt nút X trên góc (nếu muốn)
    >
      {/* Biểu tượng khóa */}
      <LockOutlined
        style={{ fontSize: 32, color: "#1890ff", marginBottom: 16 }}
      />

      {/* Tiêu đề */}
      <Title level={4} style={{ marginBottom: 8 }}>
        Thông báo
      </Title>

      {/* Nội dung */}
      <Text>Bạn cần đăng nhập trước để tiếp tục.</Text>

      {/* Hai nút Đăng nhập / Huỷ */}
      <div
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <Button type="primary" onClick={() => router.push("/login")}>
          Đăng nhập
        </Button>
        <Button onClick={onCancel}>Huỷ</Button>
      </div>
    </Modal>
  );
};

export default ModalLoginRequire;
