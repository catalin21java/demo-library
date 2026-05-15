import "dotenv/config";
import db from "./config/db.js";

import app from "./app.js";

const port = Number(process.env.PORT) || 4000;

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API running at http://localhost:${port}`);
});

function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`${signal} received, shutting down...`);
  server.close(() => {
    db.close((closeError) => {
      if (closeError) {
        // eslint-disable-next-line no-console
        console.error(closeError);
        process.exit(1);
        return;
      }
      process.exit(0);
    });
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
