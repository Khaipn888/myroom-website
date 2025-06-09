"use client";

import React, { useState } from "react";
import { Button, Modal } from "antd";
import {
  PlusCircleOutlined,
  HomeOutlined,
  UsergroupAddOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import ModalLoginRequire from "@/components/ui/ModalLoginRequire";

const postOptions = [
  {
    label: "Cho thuê phòng",
    value: "cho-thue-phong",
    icon: <HomeOutlined style={{ fontSize: 22, color: "#1890ff" }} />,
  },
  {
    label: "Tìm người ở ghép",
    value: "o-ghep",
    icon: <UsergroupAddOutlined style={{ fontSize: 22, color: "#52c41a" }} />,
  },
  {
    label: "Pass lại đồ",
    value: "pass-do",
    icon: <ShoppingOutlined style={{ fontSize: 22, color: "#fa8c16" }} />,
  },
];

interface PostButtonProps {
  user: any;
}
export default function PostButton({ user }: PostButtonProps) {
  const [open, setOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const router = useRouter();

  const handleSelect = (value: string) => {
    // setOpen(false);
    if (!user) {
      setIsModalVisible(true);
      return;
    }
    router.push(`/post/${value}`);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  return (
    <>
      <Button
        type="primary"
        icon={<PlusCircleOutlined />}
        onClick={() => handleSelect("cho-thue-phong")}
      >
        <span className="font-semibold">Đăng tin</span>
      </Button>

      <Modal
        open={open}
        title="Chọn loại tin đăng"
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        styles={{
          body: { padding: 16 },
        }}
      >
        <div className="flex flex-col gap-4">
          {postOptions.map((item) => (
            <div
              key={item.value}
              className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition"
              onClick={() => handleSelect(item.value)}
            >
              {item.icon}
              <span className="font-medium text-lg">{item.label}</span>
            </div>
          ))}
        </div>
      </Modal>
      <ModalLoginRequire visible={isModalVisible} onCancel={handleCancel} />
    </>
  );
}
