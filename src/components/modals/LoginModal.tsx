import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useNavigate } from "@tanstack/react-router"
import LoginModule from "@/lib/features/auth/login"

export function LoginModal() {
  const navigate = useNavigate()

  const onClose = (open: boolean) => {
    if (!open) {
      navigate({ search: {} })
    }
  }

  return (
    <Dialog open modal onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Giriş yap</DialogTitle>
          <DialogDescription>İzlediğiniz herşeyi kaydedin!</DialogDescription>
        </DialogHeader>
        <LoginModule />
      </DialogContent>
    </Dialog>
  )
}