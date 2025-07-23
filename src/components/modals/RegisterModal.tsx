import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RegisterModule from "@/lib/features/auth/register";
import { useNavigate } from "@tanstack/react-router";

export function RegisterModal() {
  const navigate = useNavigate();

  const onClose = (open: boolean) => {
    if (!open) {
      navigate({ to: "/", search: {} });
    }
  };

  return (
    <Dialog open modal onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kayıt ol</DialogTitle>
          <DialogDescription>İzlediğiniz herşeyi kaydedin!</DialogDescription>
        </DialogHeader>
        <RegisterModule />
      </DialogContent>
    </Dialog>
  );
}
