"use client";

import { loginServerAction } from "@/app/actions/auth/loginAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ApiAuthLoginPost200Response } from "@/lib/api";
import {
  LOGIN_FORM_INPUTS,
  LOGIN_FORM_VALIDATION,
} from "@/lib/forms/login.form";
import { useAuthStore } from "@/lib/stores/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

export default function LoginModule() {
  const router = useRouter();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LOGIN_FORM_INPUTS>({
    resolver: zodResolver(LOGIN_FORM_VALIDATION),
  });
  const setUser = useAuthStore((state) => state.setUser);
  const [state, action, pending] = useActionState(loginServerAction, {
    message: "",
    success: false,
    data: undefined,
  });

  useEffect(() => {
    if (state.success) {
      setUser(state.data as ApiAuthLoginPost200Response);
      toast.toast({
        title: "Giriş başarılı",
        description: "Yönlendirilliyorsunuz...",
        variant: "default",
      });

      setTimeout(() => {
        router.back();
      }, 1000);

      return;
    }

    if (state.message) {
      toast.toast({
        title: "Giriş başarısız",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state]);

  const onSubmitForm: SubmitHandler<LOGIN_FORM_INPUTS> = (data) => {
    startTransition(() => {
      action(data);
    });
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmitForm)}>
      <div id="group">
        <Input
          type="email"
          id="email"
          placeholder="selman@kinnema.com"
          required
          {...register("email")}
        />
        <p className="text-red-500 text-xs mt-2">{errors.email?.message}</p>
      </div>
      <div id="group">
        <Input
          type="password"
          id="password"
          placeholder="******"
          required
          {...register("password")}
        />
        <p className="text-pink-800 text-xs mt-2">{errors.password?.message}</p>
      </div>
      <div className="flex flex-row gap-5 self-end">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Kapat
        </Button>

        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="animate-spin" />
              <span>Giriş yapılıyor...</span>
            </>
          ) : (
            "Giriş yap"
          )}
        </Button>
      </div>

      <hr />
      <span className="text-center">veya...</span>
      <Link href="/register" passHref legacyBehavior>
        <Button className="mb-5" type="button">
          Kayit olun
        </Button>
      </Link>
    </form>
  );
}
