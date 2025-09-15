import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "@tanstack/react-router";

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
  const navigate = useNavigate();

  const onClose = (open: boolean) => {
    if (!open) {
      navigate({ search: {} });
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
