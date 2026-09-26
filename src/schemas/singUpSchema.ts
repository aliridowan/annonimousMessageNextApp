import { z } from "zod";

export const userNameValidation = z
  .string()
  .min(2, "Username must containg at least two charecters")
  .max(20, "Username must not containg more then 20 charecters")
  .regex(/^[a-zA-Z0-9]+$/, "Username must only contain letters and numbers");

export const singUpSchema = z.object({
  username: userNameValidation,
  email: z
    .string()
    .email({ message: "Invalid email Address" }),

  password: z
    .string()
    .min(6, { message: "password must containg 6 charecters" })
    .max(20, { message: "password must not containg more then 20 charecters" }),
});
