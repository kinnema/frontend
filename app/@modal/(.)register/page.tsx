"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RegisterModule from "@/lib/features/auth/register";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default () => {
  const router = useRouter();

  return (
    <Dialog open modal>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kayıt ol</DialogTitle>
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

        <RegisterModule />
      </DialogContent>
    </Dialog>
  );
};
