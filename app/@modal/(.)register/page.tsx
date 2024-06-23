"use client";

import { Modal } from "@/lib/components/Modal";
import RegisterModule from "@/lib/features/auth/register";
import { usePathname } from "next/navigation";

export default () => {
  const pathName = usePathname();

  return (
    <Modal isOpen={pathName.includes("/register")} title="Kayit ol">
      <RegisterModule />
    </Modal>
  );
};
