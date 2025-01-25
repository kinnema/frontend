"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface DialogWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;

  contentProps?: React.HTMLAttributes<HTMLDivElement>;
}

export default function DialogWrapper({
  children,
  title,
  description,
  footer,
  contentProps,
}: DialogWrapperProps) {
  const router = useRouter();

  const onClose = (open: boolean) => {
    if (!open) {
      router.back();
    }
  };

  return (
    <Dialog open modal onOpenChange={onClose}>
      <DialogContent {...contentProps}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
