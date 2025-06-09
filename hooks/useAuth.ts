// hooks/useAuth.ts
import { useUserStore } from "@/store/userStore"; // Sử dụng store đã tạo
import { getMyProfile, logoutApi } from "@/api/auth";
import { useRouter } from "next/navigation";

const useAuth = () => {
  const { user, setUser, logout } = useUserStore();
  const router = useRouter();

  // Hàm lấy thông tin người dùng
  const getMe = async () => {
    try {
      const response = await getMyProfile(); // Giả sử API trả về thông tin người dùng
      setUser(response.data); // Lưu thông tin người dùng vào zustand store
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  // Hàm đăng xuất
  const handleLogout = async () => {
    try {
      await logoutApi(); // Gọi API logout
      logout(); // Xoá user khỏi store
      router.push("/home"); 
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return {
    user,
    getMe,
    handleLogout,
  };
};

export default useAuth;
