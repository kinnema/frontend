"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type ElementRef } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<ElementRef<"dialog">>(null);

  dialogRef.current?.addEventListener("close", () => {
    document.body.style.overflow = "scroll";
  });
  useEffect(() => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, []);

  function onDismiss() {
    dialogRef.current?.close();
    router.back();
  }

  return createPortal(
    <div className="modal-backdrop bg-black">
      <dialog
        ref={dialogRef}
        className="w-full h-full bg-black flex flex-col"
        onClose={onDismiss}
      >
        {children}
        <button onClick={onDismiss} className="close-button z-10">
          <FiX size={20} color="white" />
        </button>
      </dialog>
    </div>,
    document.getElementById("modal-root")!
  );
}
