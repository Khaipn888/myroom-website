"use client";

import HeaderComponent from "@/components/ui/HeaderComponent";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, getMe } = useAuth();

  useEffect(() => {
    if (!user) {
      getMe(); // Chỉ gọi API nếu chưa có user
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed w-full z-50">
        <HeaderComponent isMainLayout={true} />
      </div>
      <main className="bg-[#f9f9f9] w-full flex-1 px-2 py-4 xl:px-32 2xl:px-64 pt-20">
        {children}
      </main>
    </div>
  );
}
