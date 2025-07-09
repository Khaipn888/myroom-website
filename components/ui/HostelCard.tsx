// components/HostelCard.tsx
"use client";

import React from "react";
import { Card, Space, Popconfirm } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

// Nếu đã có interface Hostel và Service ở chỗ khác, import vào.
// Còn không, bạn có thể giữ nguyên định nghĩa như dưới:
export interface Hostel {
  _id: string;
  name: string;
  totalRoom: number;
  floorCount: number;
  currentOccupants?: number;
  address: string;
  electricityPrice: number;
  waterPrice: number;
  services: { name: string; price: number; unit: string }[];
  deadline: Date
}

interface HostelCardProps {
  hostel: any;
  isOwner: boolean;
  onDelete: (id: string) => void;
  onEdit: (hostel: Hostel) => void;
  onSelect: (h: any) => void;
}

const HostelCard: React.FC<HostelCardProps> = ({
  hostel: h,
  isOwner,
  onDelete,
  onEdit,
  onSelect,
}) => {
  return (
    <Card
      className=" !border-gray-300 hover:shadow-md"
      title={h.name}
      extra={
        isOwner && (
          <Space>
            <Popconfirm
              title="Bạn có chắc muốn xóa nhà trọ này?"
              onConfirm={(e) => {
                e?.stopPropagation();
                onDelete(h._id);
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
                onEdit(h);
              }}
              style={{ color: "#1890ff", fontSize: 16 }}
            />
          </Space>
        )
      }
      onClick={() => onSelect(h)}
      style={{ cursor: "pointer" }}
    >
      <div className="space-y-4">
        {/* Thông tin cơ bản, gồm Số tầng, Số phòng, Số người ở, Giá điện, Giá nước, Địa chỉ */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex font-semibold gap-2">
            <span className="text-gray-600">Số tầng:</span>
            <span>{h.floorCount}</span>
          </div>
          <div className="flex font-semibold gap-2">
            <span className="text-gray-600">Số phòng:</span>
            <span>{h.totalRoom}</span>
          </div>
          <div className="flex font-semibold gap-2">
            <span className="text-gray-600">Số người ở:</span>
            <span>{h.totalMembers}</span>
          </div>
          <div className="flex font-semibold gap-2">
            <span className="text-gray-600">Phòng còn trống:</span>
            <span>{h.emptyRoom}</span>
          </div>
          <div className="flex font-semibold gap-2">
            <span className="text-gray-600">Giá điện:</span>
            <span>
              {h.services[0]?.price.toLocaleString() +
                " " +
                h.services[0]?.unit}
            </span>
          </div>
          <div className="flex font-semibold gap-2">
            <span className="text-gray-600">Giá nước:</span>
            <span>
              {h.services[1]?.price.toLocaleString() +
                " " +
                h.services[1]?.unit}
            </span>
          </div>
          <div className="flex font-semibold gap-2 col-span-2">
            <span className="text-gray-600">Hạn nộp tiền phòng:</span>
            <span className="text-right">{`Ngày ${dayjs(h.deadline).format("DD")} hàng tháng`}</span>
          </div>
          <div className="flex font-semibold gap-2 col-span-2">
            <span className="text-gray-600">Địa chỉ:</span>
            <span className="text-right">{h.address}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default HostelCard;
