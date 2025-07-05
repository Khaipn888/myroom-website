"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Dropdown, List, Tabs } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useSocket } from "@/components/provider/SocketProvider";
import { getAllNotifications, readNotification } from "@/api/notification";
import { toast } from "react-toastify";
import {
  FaExclamationCircle,
  FaRegCheckCircle,
  FaRegCommentDots,
} from "react-icons/fa";
import "./style.css";
import { useRouter } from "next/navigation";

type NotificationItem = {
  _id: string;
  type: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  metadata?: any;
};

const TAB_KEYS = {
  ALL: "all",
  UNREAD: "unread",
};

export default function Notification() {
  const socket = useSocket();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(TAB_KEYS.ALL);

  const router = useRouter();
  const {
    data: notis,
    refetch,
  } = useQuery<any>({
    queryKey: ["getAllNotifications"],
    queryFn: () => getAllNotifications({}),
    staleTime: 1000 * 60,
  });
  // Hàm đánh dấu thông báo là đã đọc (có thể gọi API)
  const markAsRead = (item: any) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
    );
    handleReadNotification(item._id);
    switch (item.type) {
      case "CP":
        router.push("/posts-management");
      case "AC":
        router.push("/my-posts");
      case "RJ":
        router.push("/my-posts");
      case "AM":
        router.push("/my-hostel");
      default:
        break;
    }
  };

  useEffect(() => {
    if (notis) setNotifications(notis.data);
  }, [notis]);

  useEffect(() => {
    if (!socket) return;
    // Lắng nghe notification realtime
    const handleNotification = (notif: NotificationItem) => {
      refetch();
      toast.success(notif.content);
      setNotifications((prev) => [notif, ...prev]);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket]);

  // Chọn icon
  const getIcon = (type?: string) => {
    switch (type) {
      case "CP":
        return <FaRegCommentDots className="text-blue-500 w-5 h-5" />;
      case "AC":
        return <FaRegCheckCircle className="text-green-500 w-5 h-5" />;
      case "RJ":
        return <FaExclamationCircle className="text-red-500 w-5 h-5" />;
      case "DM":
        return <FaExclamationCircle className="text-red-500 w-5 h-5" />;
      case "AM":
        return <FaRegCheckCircle className="text-green-500 w-5 h-5" />;
      default:
        return <BellOutlined className="text-gray-500 w-5 h-5" />;
    }
  };

  const filteredNotifications =
    activeTab === TAB_KEYS.UNREAD
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  // Đếm số thông báo chưa đọc
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const menuItems = [
    {
      key: "content",
      label: (
        <div className="max-h-[600px] bg-white p-4 rounded-md overflow-y-auto">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="small"
            className="px-4 pt-4"
          >
            <Tabs.TabPane
              tab={`Tất cả (${notifications.length})`}
              key={TAB_KEYS.ALL}
            />
            <Tabs.TabPane
              tab={`Chưa đọc (${unreadCount})`}
              key={TAB_KEYS.UNREAD}
            />
          </Tabs>

          {filteredNotifications.length === 0 ? (
            <div className="p-6 text-center text-gray-400 select-none">
              Không có thông báo
            </div>
          ) : (
            <List
              dataSource={filteredNotifications}
              renderItem={(item) => (
                <List.Item
                  key={item._id}
                  className="cursor-pointer rounded-lg !px-4 py-2 flex items-center justify-between hover:bg-blue-50"
                  onClick={() => markAsRead(item)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Icon bên trái */}
                    <div className="flex-shrink-0">{getIcon(item.type)}</div>

                    {/* Nội dung thông báo */}
                    <div className="truncate min-w-0">
                      <p className="text-sm text-gray-900">{item.content}</p>
                      <p className="text-xs text-gray-500 mt-0.5 select-none">
                        {new Date(item.createdAt).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour12: false,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Chấm xanh bên phải */}
                  {!item.isRead && (
                    <span className="block h-2 w-2 rounded-full bg-blue-600 ml-3 flex-shrink-0" />
                  )}
                </List.Item>
              )}
            />
          )}
        </div>
      ),
    },
  ];

  const handleReadNotification = async (id: string) => {
    try {
      await readNotification(id);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={["click"]}
      open={visible}
      onOpenChange={setVisible}
      placement="bottom"
      arrow
      overlayClassName="my-custom-dropdown"
    >
      <Badge count={unreadCount} size="small" offset={[0, 0]}>
        <BellOutlined className="text-2xl cursor-pointer" />
      </Badge>
    </Dropdown>
  );
}
