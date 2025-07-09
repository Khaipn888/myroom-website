"use client";
import React, { useState } from "react";
import { Button, Input, Popconfirm } from "antd";
import Image from "next/image";
import { createComment, deleteComment } from "@/api/comment";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { DeleteOutlined } from "@ant-design/icons";
dayjs.extend(relativeTime);
dayjs.locale("vi");

interface Comment {
  _id?: string;
  userId: { _id?: string; avatar?: string; name?: string };
  content: string;
  createdAt?: string;
}
interface PostCommentBoxProps {
  postId: string;
  user: any;
  isShow: boolean;
  onRequestLogin: () => void;
  comments?: Comment[];
  refetchComments: () => void;
}

const PostCommentBox: React.FC<PostCommentBoxProps> = ({
  postId,
  user,
  isShow,
  onRequestLogin,
  comments = [],
  refetchComments,
}) => {
  const [comment, setComment] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Giả lập API gửi comment
  const handleSendComment = async () => {
    if (!user) {
      onRequestLogin();
      return;
    }
    if (!comment.trim()) return;
    setIsSending(true);
    try {
      await createComment({ postId, content: comment });
      setComment("");
      toast.success("Bình luận thành công!");
      refetchComments();
    } catch {
      toast.error("Gửi bình luận thất bại");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) {
      onRequestLogin();
      return;
    }
    try {
      await deleteComment(commentId);
      toast.success("Xoá bình luận thành công!");
      refetchComments();
    } catch {
      toast.error("Xoá bình luận thất bại");
    }
  };

  if (!isShow) return null;

  return (
    <div className="w-full border border-gray-300 rounded mt-2 p-3 bg-gray-50">
      <h3 className="font-semibold mb-2">Bình luận</h3>
      <div className="max-h-60 overflow-y-auto space-y-2 mb-2">
        {comments.length === 0 && (
          <p className="text-gray-500 italic">Chưa có bình luận nào</p>
        )}
        {comments.map((c, idx) => (
          <div key={c._id || idx} className="flex items-start gap-2">
            <Image
              src={c.userId?.avatar || "/images/avatar-default.jpg"}
              alt="avatar"
              width={28}
              height={28}
              className="rounded-full object-cover aspect-square"
            />
            <div>
              <div className="font-semibold text-sm">
                {c.userId?.name || "Ẩn danh"}
                {/* Chỉ hiện nút xoá với bình luận của chính mình */}
                {user && c.userId && c.userId._id === user._id && (
                  <Popconfirm
                    title="Xoá bình luận này?"
                    description="Bạn chắc chắn muốn xoá bình luận?"
                    onConfirm={() => handleDeleteComment(c._id!)}
                    okText="Xoá"
                    cancelText="Huỷ"
                  >
                    <DeleteOutlined
                      className="text-red-500 cursor-pointer ml-3 opacity-70 group-hover:opacity-100"
                      style={{ color: "red", fontSize: 14 }}
                      title="Xoá bình luận"
                    />
                  </Popconfirm>
                )}
              </div>
              <div className="text-gray-700 text-sm">{c.content}</div>
              <div className="text-xs text-gray-400">
                {c.createdAt && dayjs(c.createdAt).fromNow()}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input.TextArea
          rows={1}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            user ? "Nhập bình luận..." : "Bạn cần đăng nhập để bình luận"
          }
          disabled={!user || isSending}
          onPressEnter={(e) => {
            e.preventDefault();
            handleSendComment();
          }}
          className="flex-1"
        />
        <Button
          type="primary"
          disabled={!user || !comment.trim() || isSending}
          loading={isSending}
          onClick={handleSendComment}
        >
          Gửi
        </Button>
      </div>
    </div>
  );
};

export default PostCommentBox;
