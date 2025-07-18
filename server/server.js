import dotenv from "dotenv";
dotenv.config();
import { app, server } from "./socket/socket.js";
import express from "express";
import { connectDB } from "./db/connection1.db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { processQueue } from "./worker/newMessageWorker.js";
import { startLocalQueueFlusher } from "./worker/localFlusher.worker.js"
connectDB();
startLocalQueueFlusher();
processQueue();

app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

// routes
import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);

// middlwares
import { errorMiddleware } from "./middlewares/error.middlware.js";
app.use(errorMiddleware);

//start the worker


server.listen(PORT, () => {
  console.log(`your server listening at port ${PORT}`);
});
