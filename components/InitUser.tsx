"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { getMyProfile } from "../api/auth";

export default function InitUser() {
  const { setUser } = useUserStore();

  const fetchUser = async () => {
    try {
      const { data } = await getMyProfile();
      setUser(data);
    } catch (err) {
      console.error("Không thể lấy thông tin người dùng:", err);
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);

  return null;
}
