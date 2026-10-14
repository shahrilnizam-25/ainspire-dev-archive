import app from "./app";
import { logger } from "./lib/logger";
export { runReadinessMcpWorkflow } from "./lib/mcp.js";

if (process.env.NODE_ENV === "test") {
  // The test bundle exports MCP workflows without opening a network listener.
} else {
  const rawPort = process.env["PORT"];

  if (!rawPort) {
    throw new Error(
      "PORT environment variable is required but was not provided.",
    );
  }

  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}
