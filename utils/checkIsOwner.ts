import { useUserStore } from "../store/userStore";

export function checkIsOwner(id: string): boolean {
  const user = useUserStore.getState().user;
  return user?._id === id;
}
