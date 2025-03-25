import { z } from "zod";

export const AuthUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatar: z.string(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;
