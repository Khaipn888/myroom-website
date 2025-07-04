"use client";

import React, { useState } from "react";
import { Layout, Menu } from "antd";
import {
  SettingOutlined,
  HomeOutlined,
  ContainerOutlined,
  LogoutOutlined,
  HeartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/store/userStore";

const { Sider } = Layout;

const menuItems = [
  {
    key: "settings",
    label: "Cài đặt thông tin cá nhân",
    icon: <SettingOutlined />,
    path: "/account-setting",
  },
  {
    key: "my-posts",
    label: "Tin đăng của tôi",
    icon: <ContainerOutlined />,
    path: "/my-posts",
  },
  {
    key: "saved-posts",
    label: "Tin đã lưu",
    icon: <HeartOutlined />,
    path: "/saved-posts",
  },
  {
    key: "myrooms",
    label: "Phòng trọ của tôi",
    icon: <HomeOutlined />,
    path: "/my-hostel",
  },
  {
    key: "posts-management",
    label: "Quản lý tin đăng",
    icon: <FileProtectOutlined />,
    path: "/posts-management",
  },
  {
    key: "logout",
    label: "Đăng xuất",
    icon: <LogoutOutlined />,
    path: "/logout",
  },
];

const menuItemsAdmin = [
  {
    key: "settings",
    label: "Cài đặt thông tin cá nhân",
    icon: <SettingOutlined />,
    path: "/account-setting",
  },
  {
    key: "my-posts",
    label: "Tin đăng của tôi",
    icon: <ContainerOutlined />,
    path: "/my-posts",
  },
  {
    key: "saved-posts",
    label: "Tin đã lưu",
    icon: <HeartOutlined />,
    path: "/saved-posts",
  },
  {
    key: "myrooms",
    label: "Phòng trọ của tôi",
    icon: <HomeOutlined />,
    path: "/my-hostel",
  },
  {
    key: "posts-management",
    label: "Quản lý tin đăng",
    icon: <FileProtectOutlined />,
    path: "/posts-management",
  },
  {
    key: "logout",
    label: "Đăng xuất",
    icon: <LogoutOutlined />,
    path: "/logout",
  },
];

export default function AccountSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUserStore();

  // Xác định menu đang chọn dựa vào URL hiện tại
  const selectedKey =
    menuItems.find((item) => pathname.startsWith(item.path))?.key || "settings";

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      width={250}
      collapsedWidth={80}
      theme="light"
      className="h-full flex flex-col"
      trigger={null}
    >
      {/* Logo */}
      <div
        onClick={() => router.push("/home")}
        className={`flex items-center cursor-pointer ${
          collapsed ? "px-auto" : "px-7"
        }`}
        style={{
          height: 64,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <Image
          src={collapsed ? "/images/logo-simple.png" : "/images/logo.png"}
          alt="Logo"
          width={collapsed ? 56 : 140}
          height={collapsed ? 56 : 40}
          style={{ objectFit: "contain" }}
        />
      </div>
      <div
        className="flex justify-start my-2 px-7"
        onClick={() => setCollapsed(!collapsed)}
        style={{ cursor: "pointer" }}
      >
        {collapsed ? (
          <MenuUnfoldOutlined style={{ fontSize: 20 }} />
        ) : (
          <MenuFoldOutlined style={{ fontSize: 20 }} />
        )}
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-auto">
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          inlineCollapsed={collapsed}
          style={{ borderRight: 0 }}
          onClick={(e) => {
            const target = menuItems.find((item) => item.key === e.key);
            if (target) {
              router.push(target.path);
            }
          }}
          items={user?.role === "admin" ? menuItemsAdmin : menuItems}
        />
      </div>
    </Sider>
  );
}
