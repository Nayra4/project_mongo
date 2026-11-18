import mongoose from "mongoose";

const DEFAULT_ACTOR_IMAGE = "handsome-bearded-guy-posing-against-white-wall_273609-20597.avif";

const actorSchema = new mongoose.Schema(
    {
        name: {
        type: String,
        required: [true, 'Actor name is required'],
        trim: true
        },
        images: {
        type: [String],
        default: [DEFAULT_ACTOR_IMAGE],
        set: (val) => (!Array.isArray(val) || val.length === 0 ? [DEFAULT_ACTOR_IMAGE] : val)
        },
        birthdate: {
        type: Date
        }
    },
    {
        timestamps: true,
        id: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

actorSchema.virtual('movies', {
    ref: 'Movie',          
    localField: '_id',    
    foreignField: 'actors' 
});

export const Actor = mongoose.model('Actor', actorSchema);

