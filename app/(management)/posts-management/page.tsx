"use client";

import React, { useState, useMemo } from "react";
import {
  AutoComplete,
  Select,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Spin,
  Table,
  Tag,
} from "antd";
import { getAllPosts, getAllPostSearchSuggestions } from "@/api/admin";
import { updateStatusPost } from "@/api/post";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import debounce from "lodash/debounce";
import ReportModal from "@/components/ui/posts-management/PostReportModal";
import PostDetailModal from "@/components/ui/posts-management/PostDetailModal";
import { SearchOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";

const { Option } = Select;
const { Text } = Typography;

interface PostType {
  id: string;
  code: string;
  user: {
    id: string;
    name: string;
  };
  title: string;
  createdAt: string; // ISO string
  type: string;
  status: string;
  reports?: Array<{
    id: string;
    reason: string;
    reporter: string;
    createdAt: string;
  }>;
  // ...các trường khác tuỳ dữ liệu trả về
}

const PostManagementPage: React.FC = () => {
  // --- State cho tìm kiếm, lọc và phân trang ---
  const [searchValue, setSearchValue] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [sort, setSort] = useState<string>("createdAt:desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // State cho modal Report và Detail
  const [reportModalVisible, setReportModalVisible] = useState<boolean>(false);
  const [currentReports, setCurrentReports] = useState<PostType["reports"]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);

  // --- Lấy danh sách bài đăng của user với React Query ---
  const {
    data: myPosts,
    isLoading,
    refetch,
  } = useQuery<any>({
    queryKey: [
      "getAllMyPosts",
      keyword,
      statusFilter,
      typeFilter,
      sort,
      currentPage,
    ],
    queryFn: () =>
      getAllPosts({
        keyword,
        status: statusFilter,
        type: typeFilter,
        sort,
        page: currentPage,
        pageSize,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });

  // --- Lấy gợi ý tìm kiếm (search suggestions) ---
  const { data: suggestions } = useQuery<any>({
    queryKey: ["getSearchSuggestions", searchValue],
    queryFn: () => getAllPostSearchSuggestions({ q: searchValue }),
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

  // --- Định nghĩa cột cho Ant Design Table ---
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_: any, __: any, index: number) => {
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 200, // Giảm width cột
      render: (text: string, record: any) => (
        <Button
          type="link"
          style={{ padding: 0, height: "auto" }}
          onClick={() => {
            setSelectedPost(record);
            setDetailModalVisible(true);
          }}
        >
          <div
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              maxWidth: 200,
              whiteSpace: "normal",
            }}
          >
            {text}
          </div>
        </Button>
      ),
    },
    {
      title: "Ngày đăng",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 120,
      render: (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
    },
    {
      title: "Loại tin",
      dataIndex: "type",
      key: "type",
      align: "center",
      width: 130,
      render: (val: string) => {
        if (val === "house") return "Nhà nguyên căn";
        if (val === "room") return "Phòng lẻ";
        if (val === "co-living") return "Ở ghép";
        return val;
      },
    },
    {
      title: "Report",
      dataIndex: "reports",
      key: "reports",
      align: "center",
      width: 100,
      render: (reports: PostType["reports"]) => {
        const count = reports?.length || 0;
        return count > 0 ? (
          <Button
            type="link"
            danger
            onClick={() => {
              setCurrentReports(reports || []);
              setReportModalVisible(true);
            }}
          >
            Xem ({count})
          </Button>
        ) : (
          "–"
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 120,
      render: (val: string) => {
        switch (val) {
          case "actived":
            return <Tag color="success">Đã duyệt</Tag>;
          case "pending":
            return <Tag color="warning">Chờ duyệt</Tag>;
          case "reject":
            return <Tag color="error">Không duyệt</Tag>;
          case "disabled":
            return <Tag color="gray">Vô hiệu hoá</Tag>;
          default:
            return <Tag>{val}</Tag>;
        }
      },
    },
    {
      title: "Tuỳ chỉnh",
      key: "actions",
      align: "center",
      width: 200,
      render: (_: any, record: any) => {
        const { status } = record;

        if (status === "pending") {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  handleChangeStatusPost(record.id, "actived");
                }}
              >
                Duyệt tin
              </Button>
              <Button
                type="text"
                size="small"
                danger
                onClick={() => {
                  handleChangeStatusPost(record.id, "reject");
                }}
              >
                Không duyệt
              </Button>
            </Space>
          );
        }

        if (status === "actived") {
          return (
            <Button
              type="default"
              size="small"
              danger
              onClick={() => {
                handleChangeStatusPost(record.id, "disabled");
              }}
            >
              Vô hiệu hoá
            </Button>
          );
        }

        // status === "reject" (hoặc "disabled") => không hiện nút nào
        return null;
      },
    },
  ];

  const handleChangeStatusPost = async (postId: string, newStatus: string) => {
    try {
      await updateStatusPost({ postId, newStatus });
      refetch();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ padding: 24, backgroundColor: "white" }}>
      {/* ---------- Filter Bar: Search + Status + Type ---------- */}
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={24} md={24} lg={12}>
          <Space.Compact className="w-full">
            <AutoComplete
              options={suggestions?.data || []}
              placeholder="Tìm theo tiêu đề, địa chỉ..."
              onSelect={(value) => {
                setKeyword(value as string);
                setCurrentPage(1);
              }}
              onSearch={handleSearchDebounced}
              allowClear
              style={{
                width: "calc(100% - 32px)",
              }}
            ></AutoComplete>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => {
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
            value={statusFilter}
            onChange={(values) => {
              setStatusFilter(values as string[]);
              setCurrentPage(1);
            }}
            allowClear
          >
            <Option value="actived">Đã duyệt</Option>
            <Option value="pending">Chờ duyệt</Option>
            <Option value="reject">Không duyệt</Option>
          </Select>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <Select
            mode="multiple"
            placeholder="Loại tin"
            style={{ width: "100%" }}
            value={typeFilter}
            onChange={(values) => {
              setTypeFilter(values as string[]);
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

      {/* ---------- Tổng số tin và Select Sắp xếp ---------- */}
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

      {/* ---------- Bảng hiển thị Tin đăng ---------- */}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Spin />
        </div>
      ) : (
        <Table
          rowKey={(record) => record.id}
          columns={columns as ColumnsType<PostType>}
          dataSource={myPosts?.data?.posts || []}
          pagination={false}
          bordered
        />
      )}

      {/* ---------- Modal xem Report ---------- */}
      <ReportModal
        visible={reportModalVisible}
        reports={currentReports || []}
        onClose={() => {
          setReportModalVisible(false);
          setCurrentReports([]);
        }}
      />

      {/* ---------- Modal xem Chi tiết tin đăng ---------- */}
      <PostDetailModal
        visible={detailModalVisible}
        post={selectedPost}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedPost(null);
        }}
      />
    </div>
  );
};

export default PostManagementPage;
