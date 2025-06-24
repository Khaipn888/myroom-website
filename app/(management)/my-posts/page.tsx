"use client";

import React, { useState, useMemo } from "react";
import {
  AutoComplete,
  Select,
  Row,
  Col,
  Typography,
  Pagination,
  Button,
  Space,
  Spin,
} from "antd";
import { getAllMyPosts, getSearchSuggestions } from "@/api/user";
import { deletePost } from "@/api/post";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import debounce from "lodash/debounce";
import { useRouter } from "next/navigation";

// Import PostCard mới của bạn
import PostCard from "@/components/ui/PostCard";
import { SearchOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

const { Option } = Select;
const { Text } = Typography;

const PostManagementPage = () => {
  // State cho tìm kiếm, lọc và phân trang
  const [searchValue, setSearchValue] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [status, setStatus] = useState<string[]>([]);
  const [type, setType] = useState<string[]>([]);
  const [sort, setSort] = useState<string>("createdAt:desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;
  const router = useRouter();
  // Lấy danh sách bài đăng của chính user
  const {
    data: myPosts,
    isLoading,
    refetch,
  } = useQuery<any>({
    queryKey: ["getAllMyPosts", keyword, status, type, sort, currentPage],
    queryFn: () =>
      getAllMyPosts({
        keyword,
        status,
        type,
        sort,
        page: currentPage,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });

  // Lấy gợi ý tìm kiếm (search suggestions)
  const { data: suggestions } = useQuery<any>({
    queryKey: ["getSearchSuggestions", searchValue],
    queryFn: () => getSearchSuggestions({ q: searchValue }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });

  // Debounce khi người dùng gõ
  const handleSearchDebounced = useMemo(
    () =>
      debounce((value: string) => {
        setSearchValue(value);
      }, 300),
    []
  );
  const handleDeletePost = async (id: string) => {
    try {
      await deletePost(id);
      toast.success("Đã xoá thành công");
      refetch();
    } catch (error) {
      console.log(error);
      toast.error("Xoá tin đăng thất bại, vui lòng thử lại sau.");
    }
  };

  const handleEditPost = (id: string) => {
    router.push(`/post/edit/${id}`);
  };

  return (
    <div style={{ padding: 24, backgroundColor: "white" }}>
      {/* ---------- Hàng chứa AutoComplete + Nút Tìm kiếm + 2 Select (Trạng thái, Loại tin) ---------- */}
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={24} md={24} lg={12}>
          <Space.Compact className="w-full">
            <AutoComplete
              options={suggestions?.data || []}
              placeholder="Tìm theo tiêu đề, địa chỉ ..."
              onSelect={(value) => {
                setKeyword(value as string);
                setCurrentPage(1);
              }}
              onSearch={handleSearchDebounced}
              allowClear
              style={{
                width: "calc(100% - 32px)",
              }}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => {
                // Khi bấm nút, gán keyword = searchValue để trigger query
                setKeyword(searchValue);
                setCurrentPage(1);
              }}
            />
          </Space.Compact>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <Select
            mode="multiple"
            placeholder="Trạng thái"
            style={{ width: "100%" }}
            value={status}
            onChange={(values) => {
              setStatus(values as string[]);
              setCurrentPage(1);
            }}
            allowClear
          >
            <Option value="actived">Đã duyệt</Option>
            <Option value="pending">Chờ duyệt</Option>
            <Option value="reject">Bị từ chối</Option>
            <Option value="disabled">Vô hiệu hoá</Option>
            <Option value="draft">Nháp</Option>
          </Select>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <Select
            mode="multiple"
            placeholder="Loại tin"
            style={{ width: "100%" }}
            value={type}
            onChange={(values) => {
              setType(values as string[]);
              setCurrentPage(1);
            }}
            allowClear
          >
            <Option value="house">Nhà nguyên căn</Option>
            <Option value="room">Phòng lẻ</Option>
            <Option value="co-living">Ở ghép</Option>
          </Select>
        </Col>
      </Row>

      {/* ---------- Hàng chứa Tổng số tin và Select Sắp xếp ---------- */}
      <Row
        justify="space-between"
        align="middle"
        style={{ marginTop: 16, marginBottom: 16 }}
      >
        <Col>
          <Text strong>
            Tổng số tin đăng: {myPosts?.data?.pagination?.total || 0}
          </Text>
        </Col>
        <Col>
          <Select
            size="small"
            value={sort}
            style={{
              minWidth: 150,
            }}
            onChange={(value) => {
              setSort(value as string);
              setCurrentPage(1);
            }}
          >
            <Option value="createdAt:desc">Mới nhất</Option>
            <Option value="price:asc">Giá thấp đến cao</Option>
            <Option value="price:desc">Giá cao đến thấp</Option>
          </Select>
        </Col>
      </Row>

      {/* ---------- Lưới hiển thị PostCard ---------- */}
      <Row gutter={[16, 16]}>
        {isLoading ? (
          <Col span={24}>
            <div className="flex justify-center items-center py-10">
              <Spin />
            </div>
          </Col>
        ) : (
          myPosts?.data?.posts?.map((post: any) => (
            <Col key={post.id} xs={24} sm={24} lg={24} xxl={12}>
              <PostCard
                cardValues={post}
                handleDeletePost={handleDeletePost}
                handleEditPost={handleEditPost}
              />
            </Col>
          ))
        )}
      </Row>

      {/* ---------- Pagination ---------- */}
      {myPosts?.data?.pagination?.total > 15 && (
        <Row justify="center" style={{ marginTop: 24 }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={myPosts?.data?.pagination?.total || 0}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </Row>
      )}
    </div>
  );
};

export default PostManagementPage;
