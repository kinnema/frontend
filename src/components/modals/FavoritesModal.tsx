import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useNavigate } from "@tanstack/react-router"
import { FavoritesPageFeature } from "@/lib/features/favorites/FavoritesPage"

export function FavoritesModal() {
  const navigate = useNavigate()

  const onClose = (open: boolean) => {
    if (!open) {
      navigate({ search: {} })
    }
  }

  return (
    <Dialog open modal onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Favoriler</DialogTitle>
          <DialogDescription>İzlediğiniz herşeyi kaydedin!</DialogDescription>
        </DialogHeader>
        <FavoritesPageFeature />
      </DialogContent>
    </Dialog>
  )
}