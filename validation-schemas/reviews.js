import {z} from "zod"
import {review_sch} from "./movies.js"

export {review_sch}
export const review_update_sch=review_sch.partial()