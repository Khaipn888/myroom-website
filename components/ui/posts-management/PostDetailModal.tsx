import React from "react";
import { Button, Modal } from "antd";
import PostMediaCarousel from "@/components/ui/PostMediaCarousel";
import {
  FaBolt,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaTint,
} from "react-icons/fa";
import { GiPriceTag } from "react-icons/gi";
import PostDetailMap from "@/components/ui/maps/PostDetailmap";
import { PhoneOutlined } from "@ant-design/icons";
import Image from "next/image";

interface Props {
  visible: boolean;
  post: any;
  onClose: () => void;
}

const PostDetailModal: React.FC<Props> = ({ visible, post, onClose }) => {
  console.log("post", post);
  if (!post) return null;

  return (
    <Modal open={visible} onCancel={onClose} footer={null} width={800}>
      <div className="space-y-4 bg-white rounded-lg">
        {/* Hình ảnh hoặc video */}

        <PostMediaCarousel media={post?.media} />
        {/* Tiêu đề, vị trí */}
        <div className="px-4 space-y-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{post?.title}</h1>
            <p className="text-gray-500 flex items-center gap-1">
              <FaMapMarkerAlt color="red" /> {post?.address}
            </p>
          </div>

          {/* Giá - Diện tích - Tiện ích */}
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4 border-t border-gray-200 p-4 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <GiPriceTag className="text-green-500" />
              <span className="font-medium">Giá thuê:</span>{" "}
              {`${post?.price.toLocaleString("vi-VN")}đ/tháng`}
            </div>
            <div className="flex items-center gap-2">
              <FaRulerCombined className="text-blue-500" />
              <span className="font-medium">Diện tích:</span>
              {`${post?.area}m²`}
            </div>
            <div className="flex items-center gap-2">
              <FaBolt className="text-yellow-500" />
              <span className="font-medium">Giá điện:</span>
              {`${post?.services[0].price.toLocaleString("vi-VN")}đ/số`}
            </div>
            <div className="flex items-center gap-2">
              <FaTint className="text-sky-500" />
              <span className="font-medium">Giá nước:</span>
              {`${post?.services[1].price.toLocaleString("vi-VN")}${
                post?.services[1].unit
              }`}
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex items-start gap-2 border-b border-gray-200 text-sm pb-4">
            <div className="flex flex-wrap gap-2">
              {post?.utilities.map((item: any) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 bg-gray-100 text-sm px-2 py-1 rounded-full text-gray-700"
                >
                  <span className="text-green-500 font-bold">✔</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
          {/* Mô tả chi tiết */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Chi tiết tin đăng</h2>
            <p className="text-gray-700 leading-relaxed">{post?.description}</p>
          </div>
          <div className="border border-gray-200 rounded p-4 space-y-3 bg-white flex flex-col items-center">
            <div className="flex items-center gap-3">
              <Image
                src={post?.userId.avatar || "/images/avatar-default.jpg"}
                alt={"avatar"}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{post?.userId.name}</p>
                <p className="text-xs text-gray-500">
                  {post?.userId?.numberOfPost || "5"} Tin đăng
                </p>
              </div>
            </div>
            <div className="flex text-sm gap-2 items-center">
              <Button type="primary" icon={<PhoneOutlined />}>
                {post?.contactPhone}
              </Button>
              <a
                href={`https://zalo.me/${post?.contactZalo}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={"/zalo.svg"}
                  width={40}
                  height={40}
                  alt="zalo"
                  className="cursor-pointer"
                />
              </a>
            </div>
          </div>
          {/* Vị trí bản đồ */}
          <div>
            <h2 className="text-lg font-semibold mb-2">
              Xem vị trí trên bản đồ
            </h2>
            <PostDetailMap location={post?.location} />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PostDetailModal;
