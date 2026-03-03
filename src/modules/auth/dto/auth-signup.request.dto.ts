import z from "zod";

export const signupRequestSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
});

export type SignupRequestDto = z.infer<typeof signupRequestSchema>;
