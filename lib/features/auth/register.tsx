"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  REGISTER_FORM_INPUTS,
  REGISTER_FORM_VALIDATION,
} from "@/lib/forms/register.form";
import { IRegisterResponse } from "@/lib/models";
import { AuthService } from "@/lib/services/auth.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";

export default function RegisterModule() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<REGISTER_FORM_INPUTS>({
    resolver: zodResolver(REGISTER_FORM_VALIDATION),
    reValidateMode: "onChange",
  });
  const toast = useToast();
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  const mutation = useMutation<IRegisterResponse, void, REGISTER_FORM_INPUTS>({
    mutationFn: (data) => AuthService.register(data),
    onSuccess(data) {
      setUser(data);
      toast.toast({
        title: "Kayıt başarılı",
        description: "Yönlendiriliyorsunuz...",
      });

      setTimeout(() => {
        router.push("/");
      }, 2000);
    },
    onError() {
      toast.toast({
        title: "Kayıt başarısız",
        description: "Lütfen tekrar deneyiniz",
        variant: "destructive",
      });
    },
  });

  const onSubmit: SubmitHandler<REGISTER_FORM_INPUTS> = async (data) => {
    await mutation.mutateAsync(data);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {errors.username?.message}
        <Input
          placeholder="Kullanıcı adınız"
          required
          {...register("username")}
        />
        <Input
          placeholder="E-Posta adresiniz"
          required
          {...register("email")}
        />
        <Input
          placeholder="Şifreniz"
          type="password"
          required
          {...register("password")}
        />
        <Input placeholder="Şifreniz (tekrar)" type="password" required />

        <Button type="submit">Kayıt ol</Button>
      </form>
    </div>
  );
}
