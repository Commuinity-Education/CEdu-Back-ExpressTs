import App from "./app";
import * as bodyParser from "body-parser";
import config from "./configs/config";
import apiRoutes from "./api/routes";
import { notFoundPage, errorHandler } from "./middlewares/404Error.middleware";
import * as morgan from "morgan";
import * as cors from "cors";
import { Server } from "socket.io";
import * as path from "path";
import * as express from "express";
import { SocketIo } from "./libs/SocektIo";

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
