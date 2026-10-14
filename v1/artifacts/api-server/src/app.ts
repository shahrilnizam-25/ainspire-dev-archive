import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const startedAt = Date.now();
  req.log.info(
    {
      event: "request_started",
      method: req.method,
      path: req.path,
      origin: req.headers.origin,
      userAgent: req.headers["user-agent"],
    },
    "Incoming API request",
  );

  res.on("finish", () => {
    req.log.info(
      {
        event: "request_finished",
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      },
      "Completed API request",
    );
  });

  next();
});

app.use("/api", router);

export default app;
