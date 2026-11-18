import z from "zod"
export const register_sch=z.object({
    username:z.string().min(2),
    email:z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
    password:z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    password_confirmation:z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    image: z
        .any()
        .optional()
        .refine(
            (file) => !file || file.size <= 5 * 1024 * 1024,
            "Image must be less than 5MB"
        )
        .refine(
            (file) =>
                !file ||
                ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype),
            "Only jpg, jpeg, png, webp and gif are allowed"
        )

}).refine((x)=>x.password===x.password_confirmation,{error:"password and password_confirm don`t match "})


export const login_shc=z.object({
    email:z.email(),
    password:z.string().min(8)
})


    export const forgot_sch = z.object({
    email: z.string().email().toLowerCase(),
    });

    export const reset_sch = z
    .object({
        email: z.string().email().toLowerCase(),
        otp: z.string().length(6),
        new_password: z
        .string()
        .min(8)
        .regex(/[A-Z]/)
        .regex(/[a-z]/)
        .regex(/\d/)
        .regex(/[^A-Za-z0-9]/),
        new_password_confirmation: z.string(),
    })
    .refine((d) => d.new_password === d.new_password_confirmation, {
        path: ["new_password_confirmation"],
        message: "passwords do not match",
    });