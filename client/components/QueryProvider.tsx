"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
// import { useState } from "react";

interface Props {
  children: React.ReactNode;
}

export const queryClient = new QueryClient();

const QueryProvider = ({ children }: Props) => {

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
export default QueryProvider;
