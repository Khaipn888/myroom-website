"use client";

import React from "react";
import Notification from "@/components/ui/notifications/Notification";
import { Layout, Button, Avatar, Dropdown } from "antd";
import {
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
  HomeOutlined,
  ContainerOutlined,
  HeartOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { useUserStore } from "@/store/userStore";
import useAuth from "@/hooks/useAuth";
import PostButton from "./PostButton";

const { Header } = Layout;

type HeaderComponentProps = {
  onLogin?: () => void;
  onLogout?: () => void;
  onPost?: () => void;
  isMainLayout: boolean;
};

export default function HeaderComponent({
  onLogin,
  isMainLayout = true,
}: HeaderComponentProps) {
  const { user } = useUserStore();
  const { handleLogout } = useAuth();

  const userMenuItems = [
    {
      key: "my-posts",
      icon: <ContainerOutlined />,
      label: <Link href="/my-posts">Tin đăng của tôi</Link>,
    },
    {
      key: "saved-posts",
      icon: <HeartOutlined />,
      label: <Link href="/saved-posts">Tin đã lưu</Link>,
    },
    {
      key: "my-room",
      icon: <HomeOutlined />,
      label: <Link href="/my-hostel">Phòng trọ của tôi</Link>,
    },
    {
      key: "setting",
      icon: <SettingOutlined />,
      label: <Link href="/account-setting">Cài đặt thông tin cá nhân</Link>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  const userMenuItemsAdmin = [
    {
      key: "my-posts",
      icon: <ContainerOutlined />,
      label: <Link href="/my-posts">Tin đăng của tôi</Link>,
    },
    {
      key: "saved-posts",
      icon: <HeartOutlined />,
      label: <Link href="/saved-posts">Tin đã lưu</Link>,
    },
    {
      key: "my-room",
      icon: <HomeOutlined />,
      label: <Link href="/my-hostel">Phòng trọ của tôi</Link>,
    },
    {
      key: "setting",
      icon: <SettingOutlined />,
      label: <Link href="/account-setting">Cài đặt thông tin cá nhân</Link>,
    },
    {
      key: "posts-management",
      icon: <FileProtectOutlined />,
      label: <Link href="/posts-management">Quản lý tin đăng</Link>,
    },
    {
      key: "users-management",
      icon: <UserOutlined />,
      label: <Link href="/users-management">Quản lý người dùng</Link>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      className={`flex ${
        isMainLayout ? "justify-between items-center" : "justify-end"
      } items-between !bg-white !shadow p-2 xl:!px-32 2xl:!px-64 border-b border-gray-200`}
    >
      {/* Logo */}
      <Link
        href={"/home"}
        className={isMainLayout ? "cursor-pointer mr-8" : "hidden"}
      >
        <Image
          width={120}
          height={40}
          src="/images/logo.png"
          alt="Phong tro cua toi"
        />
      </Link>
      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Thông báo */}
        {user && <Notification />}

        {/* Người dùng hoặc đăng nhập */}
        {user ? (
          <Dropdown
            menu={{
              items: user.role === "admin" ? userMenuItemsAdmin : userMenuItems,
            }}
            placement="bottomRight"
          >
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar src={user?.avatar} icon={<UserOutlined />} />
              <span>{user?.name}</span>
            </div>
          </Dropdown>
        ) : (
          <Button icon={<LoginOutlined />} onClick={onLogin}>
            <Link href={"/login"} className="font-semibold">
              Đăng nhập
            </Link>
          </Button>
        )}
        <PostButton user={user} />
      </div>
    </Header>
  );
}
