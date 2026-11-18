import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        number: {
        type: Number,
        required: [true, 'Rating number is required'],
        min: [0, 'Rating cannot be less than 0'],
        max: [10, 'Rating cannot be more than 10']
        },
        comment: {
        type: String,
        trim: true
        },
        movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: [true, 'Review must belong to a movie']
        },
        user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
        }
    },
    {
        timestamps: true 
    }
);


export const Review = mongoose.model('Review', reviewSchema);

