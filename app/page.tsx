"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";  // Sử dụng useRouter từ next/navigation

export default function Root() {
  const router = useRouter();

  useEffect(() => {
    router.push("/home");  // Chuyển hướng đến /home mà không cần (main)
  }, [router]);

  return null;  // Trang này không hiển thị gì
}
