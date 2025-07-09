"use client";

import React from "react";
import { Card, Space, Popconfirm, Button } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useUserStore } from "@/store/userStore";

export interface Bill {
  _id: string;
  monthYear: string;
  paidDate: string;
  amount: number;
  status: string;
  debt: number;
}

export interface Service {
  name: string;
  price: number;
  unit: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  memberCode: string;
  role: "tenant" | "manager";
  cccdFront: string;
  cccdBack: string;
}

export interface Room {
  _id: string;
  name: string;
  area: number;
  price: number;
  hostelId: string;
  rentDate?: Date;
  members?: any;
  electricityPrice?: number;
  waterPrice?: number;
  services?: Service[];
  canView: boolean;
}

interface RoomCardProps {
  room: Room;
  isOwner: boolean;
  hostelId: string;
  onEdit: (room: Room) => void;
  onDelete: (id: string) => void;
  onSelect: (room: Room) => void;
  onLeave: (data: any) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  isOwner,
  hostelId,
  onEdit,
  onDelete,
  onSelect,
  onLeave,
}) => {
  const user = useUserStore((state) => state.user);
  const code = user?.code;
  const memberId =
    room?.members?.filter((mem: any) => mem.code == user?.code)?.[0]?._id || "";
  return (
    <Card
      className={`${
        room.canView
          ? "cursor-pointer !bg-blue-100 !border-blue-900"
          : "pointer-events-none !cursor-not-allowed"
      } !border-gray-300 rounded-lg hover:shadow-md transition-shadow duration-150`}
      title={!isOwner && room.canView ? `${room.name} (của bạn)` : room.name}
      extra={
        isOwner ? (
          <Space>
            <Popconfirm
              title="Bạn có chắc muốn xóa phòng này?"
              onConfirm={(e) => {
                e?.stopPropagation();
                onDelete(room._id);
              }}
              onCancel={(e) => e?.stopPropagation()}
              okText="Xóa"
              cancelText="Hủy"
            >
              <DeleteOutlined
                onClick={(e) => e.stopPropagation()}
                style={{ color: "red", fontSize: 16 }}
              />
            </Popconfirm>
            <EditOutlined
              onClick={(e) => {
                e.stopPropagation();
                onEdit(room);
              }}
              style={{ color: "#1890ff", fontSize: 16 }}
            />
          </Space>
        ) : (
          room.canView && (
            <Space>
              <Popconfirm
                title="Bạn có chắc muốn rời khỏi phòng này?"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  onLeave({
                    roomId: room._id,
                    hostelId,
                    memberId,
                    code,
                  });
                }}
                onCancel={(e) => e?.stopPropagation()}
                okText="Có"
                cancelText="Không"
              >
                <Button
                  onClick={(e) => e.stopPropagation()}
                  icon={
                    <LogoutOutlined style={{ color: "red", fontSize: 12 }} />
                  }
                  danger
                  size="small"
                >
                  Rời phòng
                </Button>
              </Popconfirm>
            </Space>
          )
        )
      }
      onClick={() => onSelect(room)}
      styles={{
        header: { padding: "8px 16px", fontWeight: 600 },
        body: { padding: "16px" },
      }}
    >
      <div className="space-y-2 text-gray-700">
        <div className="flex justify-between">
          <span className="font-medium">Giá thuê:</span>
          <span>{room.price?.toLocaleString()} đ</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Diện tích:</span>
          <span>{room.area} m²</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Số người:</span>
          <span>{room.members?.length ?? 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Ngày thuê:</span>
          <span>
            {dayjs(room?.rentDate || Date.now()).format("DD/MM/YYYY")}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default RoomCard;
