import { z } from "@/lib/zod";

export const REGISTER_FORM_VALIDATION = z.object({
  email: z.string().email(),
  username: z.string().min(5),
  password: z.string().min(5),
});

export type REGISTER_FORM_INPUTS = z.infer<typeof REGISTER_FORM_VALIDATION>;
