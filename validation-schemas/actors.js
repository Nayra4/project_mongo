import {z} from "zod"

export const actor_sch=z.object({
    name:z.string({error:"name is required"}).min(1,"name is required"),
    birthdate:z.string().optional()
})

export const actor_update_sch=actor_sch.partial()