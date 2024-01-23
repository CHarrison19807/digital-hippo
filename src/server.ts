import express from "express";
import getPayloadClient from "./getPayload";
import { nextApp, nextHandler } from "./nextUtils";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

async function start() {
  const payload = await getPayloadClient({
    initOptions: {
      express: app,
      onInit: async (cms) => {
        cms.logger.info(`Admin URL ${cms.getAdminURL()}`);
      },
    },
  });

  app.use((req, res) => nextHandler(req, res));

  await nextApp.prepare();
  payload.logger.info(`Next.js started`);

  app.listen(PORT, async () => {
    payload.logger.info(`Express started on port ${PORT}`);
  });
}

start();
