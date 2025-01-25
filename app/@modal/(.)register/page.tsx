"use client";

import DialogWrapper from "@/lib/components/DialogWrapper";
import RegisterModule from "@/lib/features/auth/register";

export default () => {
  return (
    <DialogWrapper title="Kayıt ol" description="İzlediğiniz herşeyi kaydedin!">
      <RegisterModule />
    </DialogWrapper>
  );
};
