"use client";

import {
  ModalBody,
  ModalContent,
  ModalHeader,
  Modal as _Modal,
} from "@nextui-org/modal";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface IProps {
  children: React.ReactNode;
  isOpen: boolean;
  title: string;
  size?:
    | "md"
    | "xs"
    | "sm"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "full";
  backdrop?: "transparent" | "opaque" | "blur";
}

export function Modal({
  isOpen,
  children,
  title,
  size = "md",
  backdrop = "opaque",
}: IProps) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  function onDismiss() {
    router.back();
  }

  return (
    <>
      <_Modal
        isOpen={isOpen}
        onClose={onDismiss}
        size={size}
        backdrop={backdrop}
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
              <ModalBody>{children}</ModalBody>
            </>
          )}
          {/* <div className={classNames("h-full", { "mx-auto": center })}>
          <div className="h-full">{children}</div>
          <button onClick={onDismiss} className="close-button z-10">
            <FiX size={20} color="white" />
          </button>
        </div> */}
        </ModalContent>
      </_Modal>
    </>
  );
}
