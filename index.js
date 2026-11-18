import express from "express";
import cookieParser from "cookie-parser";
import { pagesRouter } from "./routes/pages.routes.js";
import {authroutes} from "./routes/auth.routes.js"
import {connectDB} from "./db/index.js"
import {moviesroutes} from "./routes/movie.routes.js"
import {actorsroutes} from "./routes/actor.routes.js"
import {reviewsroutes} from "./routes/review.routes.js"
const app = express();

app.use((req, res, next) => {
  console.log(new Date().toLocaleString(), req.method, req.url);
  next();
});
app.use(express.json())
app.use(cookieParser())
app.use("/uploads", express.static("uploads")) 
app.use("/auth",authroutes)
app.use("/api/movies",moviesroutes)
app.use("/api/actors",actorsroutes)
app.use("/api/reviews",reviewsroutes)
app.use(pagesRouter);

app.use((err, req, res, next) => {
  console.log("err", err);
  res.status(500).json({ error: "something went wrong" });
});

const PORT = process.env.PORT || 3000;

await connectDB()

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});