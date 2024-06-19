"use client";

import { Modal } from "@/lib/components/Modal";
import { Search } from "@/lib/components/Search";
import { usePathname } from "next/navigation";

export default function test() {
  const pathname = usePathname();

  return (
    <Modal
      title="Dizi Ara"
      isOpen={pathname.includes("/search")}
      size="3xl"
      backdrop="blur"
    >
      <Search />
    </Modal>
  );
}
