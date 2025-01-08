"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoginModule from "@/lib/features/auth/login";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <Dialog open modal>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Giriş yap</DialogTitle>
          <DialogDescription>İzlediğiniz herşeyi kaydedin!</DialogDescription>
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-white/10 text-white"
              onClick={() => router.back()}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogHeader>

        <LoginModule />
      </DialogContent>
    </Dialog>
  );
}
