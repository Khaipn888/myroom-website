import { useUserStore } from "../store/userStore";

/**
 * Kiểm tra xem bài đăng với postId có nằm trong danh sách savedPost của user không.
 * @param postId - ID của bài đăng cần kiểm tra
 * @returns true nếu bài đăng đã được lưu, false nếu chưa hoặc user chưa đăng nhập
 */
export function checkIsSavedPost(postId: string): boolean {
  const user = useUserStore.getState().user;
  if (!user || !user.savedPosts) {
      return false;
    }
  return user.savedPosts.includes(postId);
}
