import { z } from "@/lib/zod";

export const REGISTER_FORM_VALIDATION = z
  .object({
    email: z.string().email(),
    username: z.string().min(5),
    password: z.string().min(5),
    password_confirmation: z.string().min(5),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Şifreler eşleşmiyor",
    path: ["password_confirmation"],
  });

export type REGISTER_FORM_INPUTS = z.infer<typeof REGISTER_FORM_VALIDATION>;
