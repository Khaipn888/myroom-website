"use client";

import React, { useEffect } from "react";
import HeaderComponent from "@/components/ui/HeaderComponent";
import AccountSidebar from "@/components/ui/AccountSidebar";
import useAuth from "@/hooks/useAuth";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, getMe } = useAuth();

  useEffect(() => {
    if (!user) {
      getMe(); // Gọi API lấy thông tin user nếu chưa có
    }
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar bên trái */}
      <div className="flex-shrink-0">
        <AccountSidebar />
      </div>

      {/* Phần bên phải: chia theo chiều dọc (Header trên, Content dưới) */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex-none">
          <HeaderComponent isMainLayout={false} />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto bg-[#f9f9f9] px-4 xl:px-32 2xl:px-64">
          {children}
        </div>
      </div>
    </div>
  );
}
