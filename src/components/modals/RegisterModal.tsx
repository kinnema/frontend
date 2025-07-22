import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useNavigate } from "@tanstack/react-router"
import RegisterModule from "@/lib/features/auth/register"

export function RegisterModal() {
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
          <DialogTitle>Kayıt ol</DialogTitle>
          <DialogDescription>İzlediğiniz herşeyi kaydedin!</DialogDescription>
        </DialogHeader>
        <RegisterModule />
      </DialogContent>
    </Dialog>
  )
}