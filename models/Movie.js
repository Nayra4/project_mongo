import mongoose from "mongoose";

const DEFAULT_MOVIE_IMAGE = "download.jpg";
const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{11}([&?].*)?$/;

const movieSchema = new mongoose.Schema(
    {
        title: {
        type: String,
        required: [true, 'Movie title is required'],
        trim: true
        },
        year: Number,
        genres: {
        type: [String]},
        description: {
        type: String
        },
        trailerLink: {
        type: String,
        trim: true,
        validate: {
            validator: function (value) {
            return !value || YOUTUBE_REGEX.test(value);
            },
            message: 'Please provide a valid YouTube URL'
        }
        },
        image: {
        type: String,
        default: DEFAULT_MOVIE_IMAGE,
        set: (val) => (!val || val.trim() === '' ? DEFAULT_MOVIE_IMAGE : val)
        },
        director: String,
        actors: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Actor'
        }
        ]
    },
    {
        timestamps: true,
        id: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
    );

movieSchema.virtual('reviews', {
    ref: 'Review',        
    localField: '_id',     
    foreignField: 'movie' 
});

export const Movie = mongoose.model('Movie', movieSchema);

