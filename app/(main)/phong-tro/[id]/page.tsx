"use client";
import {
  HeartOutlined,
  ShareAltOutlined,
  FlagOutlined,
  PhoneOutlined,
  HeartFilled,
} from "@ant-design/icons";
import {
  FaBolt,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaTint,
} from "react-icons/fa";
import PostMediaCarousel from "@/components/ui/PostMediaCarousel";
import { useParams, useRouter } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getDetailPost, getSimilarPosts } from "@/api/post";
import FullScreenLoading from "@/components/ui/FullScreenLoading";
import Image from "next/image";
import { Button, message, Spin } from "antd";
import PostDetailMap from "@/components/ui/maps/PostDetailmap";
import { GiPriceTag } from "react-icons/gi";
import { savePost, unsavePost } from "@/api/user";
import ModalLoginRequire from "@/components/ui/ModalLoginRequire";
import { useUserStore } from "@/store/userStore";
import { useState } from "react";
import { checkIsSavedPost } from "@/utils/checkIsSavedPost";
import { convertPrice } from "@/utils/convertPrice";
import ReportPostModal from "@/components/ui/ReportPostModal";

export default function PostDetailPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const isSaved = checkIsSavedPost(id as string);
  const {
    data: postDetail,
    isLoading,
    refetch,
  } = useQuery<any>({
    queryKey: ["getDetailPost", id],
    queryFn: () => getDetailPost(id as string),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });

  const { data: similarPosts, isLoading: isLoadingSimilarPosts } =
    useQuery<any>({
      queryKey: ["getSimilarPosts", id],
      queryFn: () => getSimilarPosts(id as string),
      placeholderData: keepPreviousData,
      staleTime: 1000 * 60,
    });
  console.log(similarPosts?.data);
  if (isLoading) return <FullScreenLoading />;

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
      newList = [...currentList, id as string];
    }

    // Cập nhật lại user trong store
    setUser({
      ...user,
      savedPosts: newList,
    });
    refetch();
  };

  const changePostDetail = (id: any) => {
    router.push(`/phong-tro/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-10 gap-6">
      {/* LEFT CONTENT – 7/10 */}
      <div className="lg:col-span-7 space-y-4 bg-white rounded-lg">
        {/* Hình ảnh hoặc video */}

        <PostMediaCarousel media={postDetail?.data?.media} />
        {/* Tiêu đề, vị trí */}
        <div className="px-4 space-y-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {postDetail?.data.title}
            </h1>
            <p className="text-gray-500 flex items-center gap-1">
              <FaMapMarkerAlt color="red" /> {postDetail?.data.address}
            </p>
          </div>

          {/* Giá - Diện tích - Tiện ích */}
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4 border-t border-gray-200 p-4 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <GiPriceTag className="text-green-500" />
              <span className="font-medium">Giá thuê:</span>{" "}
              {`${postDetail?.data.price.toLocaleString("vi-VN")}đ/tháng`}
            </div>
            <div className="flex items-center gap-2">
              <FaRulerCombined className="text-blue-500" />
              <span className="font-medium">Diện tích:</span>
              {`${postDetail?.data.area}m²`}
            </div>
            <div className="flex items-center gap-2">
              <FaBolt className="text-yellow-500" />
              <span className="font-medium">Giá điện:</span>
              {`${postDetail?.data.services[0].price.toLocaleString(
                "vi-VN"
              )}đ/số`}
            </div>
            <div className="flex items-center gap-2">
              <FaTint className="text-sky-500" />
              <span className="font-medium">Giá nước:</span>
              {`${postDetail?.data.services[1].price.toLocaleString("vi-VN")}${
                postDetail?.data.services[1].unit
              }`}
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex items-start gap-2 border-b border-gray-200 text-sm pb-4">
            <div className="flex flex-wrap gap-2">
              {postDetail?.data?.utilities.map((item: any) => (
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

          {/* Hành động: lưu, chia sẻ, báo cáo */}
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={handleToggleSave}
              className="flex items-center gap-1 text-gray-600 hover:text-red-500 cursor-pointer"
            >
              {isSaved ? (
                <span>
                  <HeartFilled style={{ color: "red" }} /> Bỏ lưu tin
                </span>
              ) : (
                <span>
                  <HeartOutlined /> Lưu tin
                </span>
              )}
            </button>
            <button
              onClick={() => {
                message.success("Đã sao chép link");
                navigator.clipboard.writeText(window.location.href);
              }}
              className="flex items-center gap-1 text-gray-600 hover:text-blue-500 cursor-pointer"
            >
              <ShareAltOutlined /> Sao chép link
            </button>
            <button
              onClick={() => setIsReportModalVisible(true)}
              className="flex items-center gap-1 text-gray-600 hover:text-yellow-500 cursor-pointer"
            >
              <FlagOutlined /> Báo xấu
            </button>
          </div>

          {/* Mô tả chi tiết */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Chi tiết tin đăng</h2>
            <p className="text-gray-700 leading-relaxed">
              {postDetail?.data.description}
            </p>
          </div>

          {/* Vị trí bản đồ */}
          <div>
            <h2 className="text-lg font-semibold mb-2">
              Xem vị trí trên bản đồ
            </h2>
            <PostDetailMap location={postDetail?.data?.location} />
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR – 3/10 */}
      <div className="lg:col-span-3 space-y-2">
        {/* Người đăng */}
        <div className="border border-gray-200 rounded p-4 space-y-3 bg-white flex flex-col items-center">
          <div className="flex items-center gap-3">
            <Image
              src={
                postDetail?.data?.user.avatar || "/images/avatar-default.jpg"
              }
              alt={"avatar"}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{postDetail?.data?.user.name}</p>
              <p className="text-xs text-gray-500">25 Tin đăng</p>
            </div>
          </div>
          <div className="flex text-sm gap-2 items-center">
            <Button type="primary" icon={<PhoneOutlined />}>
              {postDetail?.data?.contactPhone}
            </Button>
            <a
              href={`https://zalo.me/${postDetail?.data?.contactZalo}`}
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

        {/* Tin đăng tương tự */}
        <div className="space-y-4 bg-white rounded p-4 border border-gray-200">
          <h2 className="font-semibold text-base">Tin đăng tương tự</h2>
          {isLoadingSimilarPosts ? (
            <div className="flex justify-center items-center">
              <Spin size="small" />
              <Spin />
            </div>
          ) : (
            similarPosts.data?.map((post: any) => (
              <div
                key={post.id}
                className="border border-gray-200 rounded p-3 text-sm space-y-1 hover:shadow cursor-pointer"
                onClick={() => changePostDetail(post.id)}
              >
                <p className="font-semibold line-clamp-2">{post.title}</p>
                <div className="flex gap-5">
                  <div className="text-sm text-gray-700 flex items-center gap-2">
                    <GiPriceTag className="text-green-500" />
                    <span className="font-medium text-primary">
                      {convertPrice(post.price)}đ/tháng
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 flex items-center gap-2">
                    <FaRulerCombined className="text-blue-500" />
                    <span>{post.area}m²</span>
                  </div>
                </div>
                <p className="text-gray-500 text-xs flex gap-2">
                  <FaMapMarkerAlt /> {post.address}
                </p>
              </div>
            ))
          )}
        </div>
        {/* Tin đăng nổi bật*/}
        <div className="space-y-4 bg-white rounded p-4 border border-gray-200">
          <h2 className="font-semibold text-base">Tin đăng mới</h2>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-gray-200 rounded p-3 text-sm space-y-1 hover:shadow"
            >
              <p className="font-semibold line-clamp-2">
                Phòng gần trường X, full nội thất gần trường X, full nội thất
                gần trường X, full nội thất
              </p>
              <div className="flex gap-5">
                <div className="text-sm text-gray-700 flex items-center gap-2">
                  <GiPriceTag className="text-green-500" />
                  <span className="font-medium text-primary">200đ/tháng</span>
                </div>

                <div className="text-sm text-gray-700 flex items-center gap-2">
                  <FaRulerCombined className="text-blue-500" />
                  <span>30m²</span>
                </div>
              </div>
              <p className="text-gray-500 text-xs flex gap-2">
                <FaMapMarkerAlt /> {postDetail?.data.address}
              </p>
            </div>
          ))}
        </div>
      </div>
      <ModalLoginRequire
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
      />
      <ReportPostModal
        visible={isReportModalVisible}
        onCancel={() => setIsReportModalVisible(false)}
        postId={id as string}
      />
    </div>
  );
}
