import z from "zod";

export const loginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginRequestDto = z.infer<typeof loginRequestSchema>;
