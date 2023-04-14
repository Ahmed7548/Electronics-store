import { z } from "zod";
import { formats } from "../regex/regex";

export const signUpSchema = z
	.object({
		first: z
			.string({
				required_error: "firts name is required",
				invalid_type_error: "firts name must be a string",
			})
			.trim()
			.min(2, { message: "first name must at least have two characters" })
			.max(50, { message: "first name mustn't exceed 50 characters" }),
		family: z
			.string({
				required_error: "family name is required",
				invalid_type_error: "family name must be a string",
			})
			.trim()
			.min(2, { message: "family name must at least have two characters" })
			.max(50, { message: "family name mustn't exceed 50 characters" }),
		email: z
			.string({
				required_error: "family name is required",
				invalid_type_error: "family name must be a string",
			})
			.trim()
			.email(),
		password: z.string().trim().regex(formats.strongPassword),
		confirmedPassword: z.string().trim(),
	})
	.refine((data) => data.password === data.confirmedPassword, {
		message: "confirmed password and password are not matching",
  });
  

  export type SignUp = z.infer<typeof signUpSchema>
