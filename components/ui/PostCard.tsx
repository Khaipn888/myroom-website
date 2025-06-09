"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FaRulerCombined,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaRegImage,
} from "react-icons/fa";
import { GiPriceTag } from "react-icons/gi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import Link from "next/link";
import { Button, Tooltip } from "antd";
import { checkIsSavedPost } from "@/utils/checkIsSavedPost";
import { useUserStore } from "@/store/userStore";
import { savePost, unsavePost } from "@/api/user";
import ModalLoginRequire from "@/components/ui/ModalLoginRequire";

dayjs.extend(relativeTime);
dayjs.locale("vi");

interface PostCardProps {
  id: string;
  title: string;
  price: number;
  area: number;
  address: string;
  media: string[];
  userId: any;
  contactPhone: string;
  createdAt: string;
  utilities?: string[];
  status?: "pending" | "actived" | "reject";
}

const PostCard: React.FC<PostCardProps> = ({
  id,
  title,
  price,
  area,
  address,
  media,
  userId,
  createdAt,
  utilities = [],
  status,
}) => {
  const imageUrl = media?.[0] || "/placeholder.png";
  const totalImages = media?.length || 0;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const isSaved = checkIsSavedPost(id);

  const handleToggleSave = async () => {
    if (!user) {
      setIsModalVisible(true);
      return;
    }

    const currentList = user.savedPosts || [];

    let newList: string[];
    if (isSaved) {
      await unsavePost({ postId: id });
      newList = currentList.filter((postId) => postId !== id);
    } else {
      // Lưu mới
      await savePost({ postId: id });
      newList = [...currentList, id];
    }

    // Cập nhật lại user trong store
    setUser({
      ...user,
      savedPosts: newList,
    });
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const renderStatusBadge = (statusValue: string) => {
    switch (statusValue) {
      case "pending":
        return (
          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
            Chưa được duyệt
          </span>
        );
      case "actived":
        return (
          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
            Đã được duyệt
          </span>
        );
      case "reject":
        return (
          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
            Từ chối
          </span>
        );
      case "disabled":
        return (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
            Vô hiệu hoá
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-lg overflow-hidden shadow hover:shadow-lg transition bg-white max-w-[800px] md:p-4 mb-2">
      <div className="md:grid md:grid-cols-2 md:gap-3">
        <Link href={`/phong-tro/${id}`}>
          <div className="relative min-h-48 h-48 w-full cursor-pointer overflow-hidden md:rounded-lg rounded-t-lg mb-1 md:mb-0">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover md:rounded-lg rounded-t-lg hover:scale-105 transition duration-300"
              unoptimized
            />
            {totalImages > 1 && (
              <div className="absolute top-2 left-2 bg-black/50 bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                <FaRegImage />
                <span>{totalImages}</span>
              </div>
            )}
          </div>
        </Link>
        <div className="flex flex-col justify-between px-3 pb-3 md:px-0 md:pb-0">
          <div className="space-y-2">
            <Link href={`/phong-tro/${id}`}>
              <h3 className="text-lg font-semibold line-clamp-2 cursor-pointer hover:text-blue-700">
                {title}
              </h3>
            </Link>

            <div className="flex gap-5">
              <div className="text-sm text-gray-700 flex items-center gap-2">
                <GiPriceTag className="text-green-500" />
                <span className="font-medium text-primary">
                  {price.toLocaleString()}đ / tháng
                </span>
              </div>

              <div className="text-sm text-gray-700 flex items-center gap-2">
                <FaRulerCombined className="text-blue-500" />
                <span>{area} m²</span>
              </div>
            </div>

            <div className="text-sm text-gray-700 flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-500" />
              <span className="line-clamp-1">{address}</span>
            </div>

            {utilities && utilities.length > 0 && (
              <div className="mt-2 overflow-hidden line-clamp-2">
                {utilities.map((util) => (
                  <span
                    key={util}
                    className="inline-block items-center gap-1 px-1 py-0.5 bg-gray-100 rounded text-[10px] font-semibold text-gray-700 mr-2 mb-1"
                  >
                    <FaCheckCircle className="text-green-500 inline-block align-text-bottom" />
                    {util}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={userId?.avatar || "/images/avatar-default.jpg"}
                alt={userId?.name}
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{userId?.name}</p>
                <p className="text-[10px] text-gray-500 truncate">
                  {dayjs(createdAt).fromNow()}
                </p>
              </div>
            </div>
            <div className="flex items-end gap-2">
              {status ? (
                <div>{renderStatusBadge(status)}</div>
              ) : (
                <Tooltip title={isSaved ? "Bỏ lưu tin" : "Lưu tin"}>
                  <Button
                    icon={
                      isSaved ? (
                        <HeartFilled style={{ fontSize: 20, color: "red" }} />
                      ) : (
                        <HeartOutlined style={{ fontSize: 20 }} />
                      )
                    }
                    size="small"
                    danger
                    type="text"
                    onClick={handleToggleSave}
                  ></Button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>
      <ModalLoginRequire visible={isModalVisible} onCancel={handleCancel} />
    </div>
  );
};

export default PostCard;
