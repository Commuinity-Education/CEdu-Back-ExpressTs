import App from "./app";
import * as bodyParser from "body-parser";
import config from "./configs/config";
import apiRoutes from "./api/routes";
import { notFoundPage, errorHandler } from "./middlewares/404Error.middleware";
import  morgan from "morgan";
import  cors from "cors";
import * as path from "path";
import * as express from "express";

const app = new App(
  {
    port: +config.port,
    host: config.host,
    envType: config.env,
  },
  {
    middlewares: [
      cors(),
      bodyParser.json(),
      bodyParser.urlencoded({ extended: true }),
      morgan("dev"),
    ],
    router: [
      { path: "/", router: express.static(path.join(__dirname, "public")) },
      { path: "/api", router: apiRoutes },
    ],
    thirdParty: [notFoundPage, errorHandler],
  },
  config.dbconfig,
  config.neo4j
);

app.listen();
