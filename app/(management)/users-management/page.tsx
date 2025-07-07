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
  Pagination,
  Modal,
  Form,
  Input,
} from "antd";
import {
  getAllUserSearchSuggestions,
  getAllUsers,
  lockUser,
  unlockUser,
} from "@/api/admin";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import debounce from "lodash/debounce";
import { SearchOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { toast } from "react-toastify";

const { Option } = Select;
const { Text } = Typography;

interface UserType {
  id: string;
  name: string;
  email: string;
  createdAt: string; // ISO string
  role: string;
  status: string;
  phone: string;
  numberOfPost: number;
  // ...các trường khác tuỳ dữ liệu trả về
}

const UsersManagementPage: React.FC = () => {
  // --- State cho tìm kiếm, lọc và phân trang ---
  const [searchValue, setSearchValue] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [sort, setSort] = useState<string>("createdAt:desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [lockModalVisible, setLockModalVisible] = useState(false);
  const [lockReason, setLockReason] = useState("");
  const [lockUserId, setLockUserId] = useState<string | null>(null);
  const [lockLoading, setLockLoading] = useState(false);

  const {
    data: allUsers,
    isLoading,
    refetch,
  } = useQuery<any>({
    queryKey: [
      "getAllUsers",
      keyword,
      statusFilter,
      roleFilter,
      sort,
      currentPage,
    ],
    queryFn: () =>
      getAllUsers({
        keyword,
        status: statusFilter,
        roles: roleFilter,
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
    queryFn: () => getAllUserSearchSuggestions({ keyword: searchValue }),
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
      title: "Tên",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 100,
    },
    {
      title: "email",
      dataIndex: "email",
      key: "email",
      align: "center",
      width: 120,
      render: (email: string) => (
        <div className="max-w-[200px] text-center break-words line-clamp-2 text-sm flex justify-start">
          {email}
        </div>
      ),
    },
    {
      title: "Điện thoại",
      dataIndex: "phone",
      key: "phone",
      align: "center",
      width: 130,
      render: (phone: string) => (
        <div className="max-w-[200px] mx-auto text-center break-words line-clamp-2 text-sm">
          {phone}
        </div>
      ),
    },
    {
      title: "Số tin đăng",
      dataIndex: "numberOfPost",
      key: "numberOfPost",
      align: "center",
      width: 100,
      render: (numberOfPost: string) => (
        <div className="max-w-[200px] mx-auto text-center break-words line-clamp-2 text-sm">
          {numberOfPost}
        </div>
      ),
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
            return <Tag color="success">Đang hoạt động</Tag>;
          case "pending":
            return <Tag color="warning">Chưa xác thực</Tag>;
          case "deactive":
            return <Tag color="gray">Vô hiệu hoá</Tag>;
          case "clocked":
            return <Tag color="error">Đã bị khoá</Tag>;
          case "deleted ":
            return <Tag color="error">Đã bị xoá</Tag>;
          default:
            return <Tag>{val}</Tag>;
        }
      },
    },
    {
      title: "Ngày tạo",
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
      title: "Tuỳ chỉnh",
      key: "actions",
      align: "center",
      width: 200,
      render: (_: any, record: any) => {
        const { status } = record;

        if (status === "locked") {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  handleUnlockUser(record._id);
                }}
              >
                Mở khoá
              </Button>
            </Space>
          );
        }

        if (status === "actived") {
          return (
            <Button
              type="primary"
              size="small"
              danger
              onClick={() => {
                setLockUserId(record._id);
                setLockModalVisible(true);
              }}
            >
              Khoá tài khoản
            </Button>
          );
        }
        return null;
      },
    },
  ];

  const handleChangePageNumber = (page: number) => {
    setCurrentPage(page);
  };

  const convertDataSuggest = (data: any) =>
    data?.map((item: any) => ({
      label: `${item.name} - ${item.email}${
        item?.phone ? " - " + item.phone : ""
      }`,
      value: item.email,
    }));

  const handleUnlockUser = async (id: string) => {
    try {
      await unlockUser({ userId: id });
      refetch();
      toast.success("Tài khoản đã được mở khoá");
    } catch (error) {
      console.log(error);
      toast.error("Mở khoá thất bại vui lòng thử lại sau");
    }
  };

  return (
    <div style={{ padding: 24, backgroundColor: "white" }}>
      {/* ---------- Filter Bar: Search + Status + Type ---------- */}
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={24} md={24} lg={12}>
          <Space.Compact className="w-full">
            <AutoComplete
              options={convertDataSuggest(suggestions?.data || [])}
              placeholder="Tìm theo tên, email, số điện thoại"
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
            <Option value="actived">Đang hoạt động</Option>
            <Option value="pending">Chưa xác thực</Option>
            <Option value="clocked">Đã bị khoá</Option>
          </Select>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <Select
            mode="multiple"
            placeholder="Vai trò"
            style={{ width: "100%" }}
            value={roleFilter}
            onChange={(values) => {
              setRoleFilter(values as string[]);
              setCurrentPage(1);
            }}
            allowClear
          >
            <Option value="admin">Admin</Option>
            <Option value="user">User</Option>
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
          <Text strong>Tổng số người dùng: {allUsers?.data?.total || 0}</Text>
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
            <Option value="createdAt:asc">Cũ nhất</Option>
            <Option value="numberOfPost:asc">Ít tin đăng nhất</Option>
            <Option value="numberOfPost:desc">Nhiều tin đăng nhất</Option>
          </Select>
        </Col>
      </Row>

      {/* ---------- Bảng hiển thị user ---------- */}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Spin />
        </div>
      ) : (
        <div className="">
          <Table
            rowKey={(record) => record.id}
            columns={columns as ColumnsType<UserType>}
            dataSource={allUsers?.data?.users || []}
            pagination={false}
            scroll={{ x: "max-content" }}
            bordered
          />
          {allUsers?.data?.total > 10 && (
            <div className="flex justify-center mt-5">
              <Pagination
                defaultCurrent={1}
                total={allUsers?.data?.total}
                pageSize={10}
                onChange={handleChangePageNumber}
                size="small"
              />
            </div>
          )}
        </div>
      )}
      <Modal
        title="Khoá tài khoản"
        open={lockModalVisible}
        onCancel={() => {
          setLockModalVisible(false);
          setLockReason("");
          setLockUserId(null);
        }}
        onOk={async () => {
          if (!lockReason.trim()) {
            toast.error("Vui lòng nhập lý do khoá tài khoản!");
            return;
          }
          setLockLoading(true);
          try {
            await lockUser({ userId: lockUserId, reason: lockReason });
            setLockModalVisible(false);
            setLockReason("");
            setLockUserId(null);
            refetch();
            toast.success("Khoá tài khoản thành công");
          } catch (error) {
            console.log(error);
            toast.error("Khoá tài khoản thất bại!");
          }
          setLockLoading(false);
        }}
        confirmLoading={lockLoading}
        okText="Xác nhận khoá"
        cancelText="Huỷ"
      >
        <Form layout="vertical">
          <Form.Item
            label="Lý do khoá tài khoản"
            required
            rules={[{ required: true, message: "Vui lòng nhập lý do!" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập lý do khoá tài khoản..."
              value={lockReason}
              onChange={(e) => setLockReason(e.target.value)}
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersManagementPage;
