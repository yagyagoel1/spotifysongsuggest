import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import router from "./routes";

export const createServer = (): Express => {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: "Too many requests from this IP, please try again after 15 minutes",});
  const app = express();
  app.get("/status", (_, res) => {
    return res.json({ ok: true });
  });
  app
    .disable("x-powered-by")
    .use(urlencoded({ extended: true, limit: "50kb"  }))
    .use(json({ limit: "50kb" }))
    .use(limiter)
    .use(cors())
    .use("/api/v1",router)

  return app;
};
