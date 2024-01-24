import express from "express";
import getPayloadClient from "./getPayload";
import { nextApp, nextHandler } from "./nextUtils";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc/index";
import { inferAsyncReturnType } from "@trpc/server";
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({
  req,
  res,
});

export type ExpressContext = inferAsyncReturnType<typeof createContext>;

async function start() {
  const payload = await getPayloadClient({
    initOptions: {
      express: app,
      onInit: async (cms) => {
        cms.logger.info(`Admin URL ${cms.getAdminURL()}`);
      },
    },
  });

  app.use(
    "/api/trpc",
    trpcExpress.createExpressMiddleware({ router: appRouter, createContext })
  );

  app.use((req, res) => nextHandler(req, res));

  await nextApp.prepare();
  payload.logger.info(`Next.js started`);

  app.listen(PORT, async () => {
    payload.logger.info(`Express started on port ${PORT}`);
  });
}

start();
