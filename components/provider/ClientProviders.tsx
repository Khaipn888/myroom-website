"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GoogleProviderWrapper from "./GoogleProviderWrapper";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
// import InitUser from "../InitUser";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      {/* <InitUser /> */}
      <GoogleProviderWrapper>{children}</GoogleProviderWrapper>
      <ToastContainer position="top-right" autoClose={2000} />
    </QueryClientProvider>
  );
}
