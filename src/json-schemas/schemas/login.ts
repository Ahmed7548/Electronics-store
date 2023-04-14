import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().trim().email(),
	password: z.string().trim(),
});

export type Login = z.infer<typeof loginSchema>;
