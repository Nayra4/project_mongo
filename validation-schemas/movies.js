import {z} from "zod"

const genres=z.union([z.string().min(1),z.array(z.string())])
const actors=z.union([z.string(),z.array(z.string())])
const trailer=z.string().regex(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,"trailerLink must be a valid youtube url")

export const movie_sch=z.object({
    title:z.string({error:"title is required"}).min(1,"title is required"),
    year:z.coerce.number({error:"year is required"}).min(1888,"year must be 1888 or later").max(2100,"year must be 2100 or earlier"),
    genres:genres,
    description:z.string({error:"description is required"}).min(1,"description is required"),
    trailerLink:trailer,
    director:z.string({error:"director is required"}).min(1,"director is required"),
    actors:actors.optional()
})

export const movie_update_sch=movie_sch.partial()

export const review_sch=z.object({
    number:z.coerce.number({error:"rating is required"}).min(0,"rating must be between 0 and 10").max(10,"rating must be between 0 and 10"),
    comment:z.string().optional()
})