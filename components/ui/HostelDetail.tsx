"use client";

import React, { useState } from "react";
import { Button, Empty } from "antd";
import { DoubleLeftOutlined } from "@ant-design/icons";
import RoomFormModal from "./RoomFormModal";
import RoomDetail from "./RoomDetail";
import RoomCard from "./RoomCard";
import { createRoom, updateRoom, deleteRoom } from "@/api/room";
import { leaveRoom, sendNoti } from "@/api/user";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { checkIsOwner } from "@/utils/checkIsOwner";
import NotificationModal from "@/components/ui/hostels/NotiModal";
import dayjs from "dayjs";

interface Service {
  name: string;
  price: number;
  unit: string;
}

interface Member {
  id: string;
  name: string;
  phone: string;
  memberCode: string;
  role: "tenant" | "manager";
  cccdFront: string; // URL preview
  cccdBack: string;
}

interface Room {
  _id: string;
  name: string;
  area: number;
  price: number;
  member?: Member[];
  electricityPrice?: number;
  waterPrice?: number;
  services?: Service[];
  canView: boolean;
  rentDate?: Date;
}

const HostelDetail = ({
  hostel,
  hostelDetail,
  onBack,
}: {
  hostel: any;
  hostelDetail: any;
  onBack: () => void;
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [notiModalOpen, setNotiModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Thêm hoặc cập nhật phòng
  const handleSaveRoom = async (
    data: Partial<Room> & { services?: Room["services"] }
  ) => {
    if (editingRoom) {
      try {
        await updateRoom({ id: editingRoom._id, data });
        queryClient.invalidateQueries({ queryKey: ["getHostelDetail"] });
        toast.success("Sửa thành công");
      } catch (error) {
        console.log(error);
        toast.error("Sửa thất bại");
      }
    } else {
      try {
        await createRoom({ ...data, hostelId: hostel._id });
        queryClient.invalidateQueries({ queryKey: ["getHostelDetail"] });
        queryClient.invalidateQueries({ queryKey: ["getMyHostels"] });
        toast.success("Thêm phòng mới thành công");
      } catch (error) {
        console.log(error);
        toast.error("Thêm phòng mới thất bại");
      }
    }
    setModalOpen(false);
    setEditingRoom(null);
  };

  // Xóa phòng
  const handleDeleteRoom = async (id: string) => {
    try {
      await deleteRoom(id, hostel._id);
      queryClient.invalidateQueries({ queryKey: ["getHostelDetail"] });
      queryClient.invalidateQueries({ queryKey: ["getMyHostels"] });
      toast.success("Xoá thành công");
    } catch (error) {
      console.log(error);
      toast.error("Xoá thất bại");
    }
  };

  const handleLeaveRoom = async (data: any) => {
    try {
      await leaveRoom(data);
      queryClient.invalidateQueries({ queryKey: ["getHostelDetail"] });
      queryClient.invalidateQueries({ queryKey: ["getMyHostels"] });
      toast.success("Bạn đã rời khỏi phòng thành công");
      onBack();
    } catch (error) {
      console.log(error);
      toast.error("Không thể rời khỏi phòng");
    }
  };

  const openAddRoom = () => {
    setEditingRoom(null);
    setModalOpen(true);
  };
  const openEditRoom = (room: Room) => {
    setEditingRoom(room);
    setModalOpen(true);
  };

  const handleSendNoti = async (data: any) => {
    try {
      const payload = { ...data, hostelId: hostel._id }
      await sendNoti(payload);
      toast.success("Gửi thông báo thành công");
      setNotiModalOpen(false);
    } catch (error) {
      console.log(error);
      toast.error("Gửi thông báo thất bại, vui lòng thử lại sau");
    }
  };

  if (selectedRoom) {
    return (
      <RoomDetail
        hostel={hostel}
        room={selectedRoom}
        onBack={() => setSelectedRoom(null)}
        hostelName={hostel.name}
      />
    );
  }

  return (
    <div className="p-4 bg-white min-h-full">
      {/* Header với icon Quay lại và nút Thêm */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <DoubleLeftOutlined
            sizes={"small"}
            onClick={onBack}
            className="cursor-pointer mr-2 text-xl"
          />
          {hostel.name}
        </h2>
      </div>

      {/* 𝗣𝗵𝗮̂̀𝗻 𝘁𝗵𝗼̂𝗻𝗴 𝘁𝗶𝗻 𝗰𝗵𝘂𝗻𝗴 (𝗛𝗼𝘀𝘁𝗲𝗹 𝗜𝗻𝗳𝗼) */}
      <div className="mb-6 border border-gray-300 rounded-lg p-4">
        <h3 className="text-md font-semibold mb-2">Thông tin chung:</h3>
        <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm font-semibold">
          <div className="flex gap-2">
            <span className="text-gray-700">Số tầng:</span>
            <span>{hostel.floorCount}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-700">Tổng số phòng:</span>
            <span>{hostel.totalRoom}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-700">Số người ở hiện tại:</span>
            <span>{hostel.totalMembers}</span>
          </div>
          {hostel.services &&
            hostel.services.length > 0 &&
            hostel.services.map((s: any, idx: any) => (
              <div key={idx} className="flex gap-2">
                <span className="text-gray-700">{s.name}:</span>
                <span>{s.price?.toLocaleString() + " " + s.unit}</span>
              </div>
            ))}
        </div>
        <div className="flex text-sm font-semibold gap-2 col-span-2 mt-2">
          <span className="text-gray-600">Hạn nộp tiền phòng:</span>
          <span className="text-right">{`Ngày ${dayjs(hostel.deadline).format(
            "DD"
          )} hàng tháng`}</span>
        </div>
        <div className="flex gap-2 text-sm font-semibold mt-2">
          <span className="text-gray-700">Địa chỉ:</span>
          <span>{hostel.address}</span>
        </div>
      </div>

      {/* 𝗣𝗵𝗮̂̀𝗻 𝗱𝗮𝗻𝗵 𝘀𝗮́𝗰𝗵 𝗽𝗵𝗼̀𝗻𝗴 𝘁𝗿𝗼̣ */}
      <div className="flex justify-between">
        <h3 className="text-md font-semibold mb-2">Danh sách phòng</h3>
        {checkIsOwner(hostelDetail?.data.hostel.ownerId) && (
          <div className="flex gap-4">
            <Button size="small" type="primary" onClick={openAddRoom}>
              Thêm phòng
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={() => setNotiModalOpen(true)}
            >
              Gửi thông báo
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {hostelDetail?.data?.rooms?.length === 0 ? (
          <div className="flex justify-center items-center sm:col-span-2 py-10">
            <Empty
              description={
                <span className="text-gray-500 font-semibold">
                  Chưa có phòng nào
                </span>
              }
            />
          </div>
        ) : (
          hostelDetail?.data?.rooms?.map((room: any) => (
            <RoomCard
              key={room._id}
              room={room}
              onEdit={openEditRoom}
              onDelete={handleDeleteRoom}
              onSelect={setSelectedRoom}
              onLeave={handleLeaveRoom}
              hostelId={hostel?._id}
              isOwner={checkIsOwner(hostelDetail?.data.hostel.ownerId)}
            />
          ))
        )}
      </div>

      {/* Modal Thêm/Sửa phòng */}
      <RoomFormModal
        visible={modalOpen}
        room={editingRoom}
        onClose={() => {
          setModalOpen(false);
          setEditingRoom(null);
        }}
        onSave={handleSaveRoom}
      />
      <NotificationModal
        open={notiModalOpen}
        onClose={() => setNotiModalOpen(false)}
        onSend={handleSendNoti}
      />
    </div>
  );
};

export default HostelDetail;
