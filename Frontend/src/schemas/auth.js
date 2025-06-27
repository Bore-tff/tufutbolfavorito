import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({
    message: "Por favor ingrese un email valido",
  }),
  password: z.string().min(6, {
    message: "La Contraseña debe tener 6 caracteres minimo",
  }),
});

export const registerSchema = z
  .object({
    username: z
      .string({
        required_error: "El Nombre es requerido",
      })
      .min(3, {
        message: "El Usuario debe tener 3 caracteres minimo",
      }),
    email: z.string().email({
      message: "Por favor ingrese un email valido",
    }),
    password: z.string().min(6, {
      message: "La Contraseña debe tener 6 caracteres minimo",
    }),
    confirmPassword: z.string().min(6, {
      message: "La Contraseña debe tener 6 caracteres minimo",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las Contraseñas no coinciden",
    path: ["confirmPassword"],
  });

  export const forgotPasswordSchema = z.object({
    email: z.string().email("El email no es válido"),
  });
  
  export const resetPasswordSchema = z.object({
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
  });