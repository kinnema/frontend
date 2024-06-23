"use client";

import Button from "@/lib/components/Button";
import {
  REGISTER_FORM_INPUTS,
  REGISTER_FORM_VALIDATION,
} from "@/lib/forms/register.form";
import { IRegisterResponse } from "@/lib/models";
import { AuthService } from "@/lib/services/auth.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@nextui-org/input";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function RegisterModule() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<REGISTER_FORM_INPUTS>({
    resolver: zodResolver(REGISTER_FORM_VALIDATION),
    reValidateMode: "onChange",
  });
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  const mutation = useMutation<IRegisterResponse, void, REGISTER_FORM_INPUTS>({
    mutationFn: (data) => AuthService.register(data),
    onSuccess(data) {
      setUser(data);
      toast.success("Kayit basarili");

      setTimeout(() => {
        router.back();
      }, 200);
    },
    onError() {
      toast.error("Kayit   yapilamadi");
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
          label="Kullanici adi"
          placeholder="Ava.12"
          required
          isRequired
          isInvalid={errors?.username ? true : false}
          errorMessage={errors?.username && errors.username.message}
          {...register("username")}
        />
        <Input
          label="Email"
          placeholder="admin@admin.com"
          required
          isRequired
          {...register("email")}
        />
        <Input
          label="Sifre"
          placeholder="*****"
          required
          isRequired
          {...register("password")}
        />
        <Input label="Sifre(tekrar)" placeholder="******" required isRequired />

        <Button type="submit">Kayit ol</Button>
      </form>
    </div>
  );
}
