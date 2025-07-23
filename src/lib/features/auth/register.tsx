"use client";

import { registerServerAction } from "@/app/actions/auth/registerAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  REGISTER_FORM_INPUTS,
  REGISTER_FORM_VALIDATION,
} from "@/lib/forms/register.form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { startTransition, useActionState, useEffect } from "react";
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
  const navigate = useNavigate();
  const [state, action, pending] = useActionState(registerServerAction, {
    message: "",
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      toast.toast({
        title: "Kayıt başarılı",
        description: "Lütfen Giris Yapiniz, yönlendiriliyorsunuz...",
        variant: "default",
      });

      startTransition(() => {
        setTimeout(() => {
          router.back();
        }, 1000);
      });

      return;
    }

    if (state.message) {
      toast.toast({
        title: "Kayıt başarısız",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state]);

  const onSubmit: SubmitHandler<REGISTER_FORM_INPUTS> = async (data) => {
    startTransition(() => {
      action(data);
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div id="group">
          <Input
            placeholder="Kullanıcı adınız"
            required
            {...register("username")}
          />
          {errors.username?.message && (
            <p className="text-pink-800 text-xs mt-2">
              {errors.username.message}
            </p>
          )}
        </div>
        <div id="group">
          <Input
            placeholder="E-Posta adresiniz"
            required
            {...register("email")}
          />
          {errors.email?.message && (
            <p className="text-pink-800 text-xs mt-2">{errors.email.message}</p>
          )}
        </div>
        <div id="group">
          <Input
            placeholder="Şifreniz"
            type="password"
            required
            {...register("password")}
          />
          {errors.password?.message && (
            <p className="text-pink-800 text-xs mt-2">
              {errors.password.message}
            </p>
          )}
        </div>
        <div id="group">
          <Input
            placeholder="Şifreniz (tekrar)"
            type="password"
            required
            {...register("password_confirmation")}
          />
          {errors.password_confirmation?.message && (
            <p className="text-pink-800 text-xs mt-2">
              {errors.password_confirmation.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>İşleniyor...</span>
            </>
          ) : (
            "Kayıt ol"
          )}
        </Button>
      </form>
    </div>
  );
}
