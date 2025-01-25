import { z } from "@/lib/zod";

export const LOGIN_FORM_VALIDATION = z.object({
  email: z.string().email(),
  password: z.string().min(5),
});

export type LOGIN_FORM_INPUTS = z.infer<typeof LOGIN_FORM_VALIDATION>;
