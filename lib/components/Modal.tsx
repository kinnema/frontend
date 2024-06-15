"use client";

import classNames from "classnames";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import _Modal from "react-modal";

_Modal.setAppElement("#modal-root");

export function Modal({
  children,
  bgColor,
  center,
  shouldCloseOnOverlayClick = false,
  isOpen,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  bgColor?: string;
  center?: boolean;
  shouldCloseOnOverlayClick?: boolean;
}) {
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
        onRequestClose={onDismiss}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
        preventScroll={true}
        // @ts-ignore
        parentSelector={() => document.querySelector("#modal-root")}
        style={{
          content: {
            inset: 10,
            background: "transparent",
            border: 0,
          },
          overlay: {
            backgroundColor: bgColor ?? "rgba(0, 0, 0, 0.55)",
          },
        }}
      >
        <div className={classNames("h-full", { "mx-auto": center })}>
          <div className="h-full">{children}</div>
          <button onClick={onDismiss} className="close-button z-10">
            <FiX size={20} color="white" />
          </button>
        </div>
      </_Modal>
    </>
  );
}
