"use client";

import { Transition } from "@/lib/components/Transition";
import { PropsWithChildren } from "react";

export default function Template({ children }: PropsWithChildren) {
  return <Transition>{children}</Transition>;
}
