"use client";

import DialogWrapper from "@/lib/components/DialogWrapper";
import LoginModule from "@/lib/features/auth/login";

export default function Page() {
  return (
    <DialogWrapper
      title="Giriş yap"
      description="İzlediğiniz herşeyi kaydedin!"
    >
      <LoginModule />
    </DialogWrapper>
  );
}
