"use client";

import { Modal } from "@/lib/components/Modal";
import LoginModule from "@/lib/features/auth/login";
import { usePathname } from "next/navigation";

export default function Page() {
  const pathName = usePathname();

  return (
    <Modal isOpen={pathName.includes("/login")} title="Giris Yap">
      <LoginModule />
    </Modal>
  );
}
