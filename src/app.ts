import  express from "express";
import { Application } from "express";
import { createServer, HttpBase } from "http";
const chalk = require("chalk");
import { Sequelize, Dialect } from "sequelize";
import Router from "./interfaces/router.interface";
import InitModels from "./models/Init";
import { Neo4jInitial } from "./libs/Neo4j";
import { _Seqeulize } from "./libs/Seqeulize";
import { SocketIo } from "./libs/SocektIo";
import { Server } from "socket.io";
import config from './configs/config'


export default class App {
  private app: Application;
   httpServer;
  private readonly port: number;
  private readonly host: string;
  private readonly Env: string;

  constructor(
    private appConfig: { port: number; host: string; envType: string },
    private _app: { middlewares: any[]; router: Router[]; thirdParty: any[] },
    private dbconfig: {
      database: string;
      username: string;
      password: string;
      host: string;
      driver: Dialect;
      options?: any;
    },
    private neo4jConn: { url: string; userName: string; password: string },
    private socketPort?: number
  ) {
    this.port = appConfig.port;
    this.host = appConfig.host;
    this.Env = appConfig.envType;
    this.initServer();
    this.mainMiddlewares(_app.middlewares);
    this.router(_app.router);
    this.thirdPartyMiddlewares(_app.thirdParty);
    this.configDB(
      dbconfig.database,
      dbconfig.username,
      dbconfig.password,
      dbconfig.host,
      dbconfig.driver,
      dbconfig.options
    );
    this.initialNeo4j(neo4jConn.url, neo4jConn.userName, neo4jConn.password);
    this.initialSocket();
  }

  private initServer() {
    this.app = express();
    this.httpServer = createServer(this.app);
  }

  private mainMiddlewares(middleWares: {
    forEach: (arg0: (middleWare: any) => void) => void;
  }) {
    middleWares.forEach((middleWare) => {
      this.app.use(middleWare);
    });
  }

  private thirdPartyMiddlewares(middleWares: {
    forEach: (arg0: (middleWare: any) => void) => void;
  }) {
    middleWares.forEach((middleWare) => {
      this.app.use(middleWare);
    });
  }

  public router(routes: Router[]) {
    routes.forEach((route) => {
      this.app.use(route.path, route.router);
    });
  }

  private async configDB(
    dbname: string,
    userName: string,
    password: string,
    host: string,
    dialect: Dialect,
    options?: any
  ) {
    const seq = new Sequelize(dbname, userName, password, {
      host,
      dialect,
      ...options.meta,
    });
    seq.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    seq
      .authenticate()
      .then(() => {
        console.log(
          chalk.green("Database Connection has been established successfully.")
        );
        new InitModels(seq);
        new _Seqeulize(seq);
        if (this.Env === "development")
          seq.sync(options.sync).then(() => {
            console.log(
              chalk.green(
                `Models Are Synced ${options.sync.force ? "By Force" : ""}`
              )
            );
          });
      })
      .catch((e) => {
        console.error(chalk.red("Unable to connect to the database:/n"), e);
      });
  }

  private initialNeo4j(url, userName, password) {
    new Neo4jInitial({ url, userName, password });
  }

  private initialSocket() {
   const io = new Server(this.httpServer,config.socket.options);
    const socekt = new SocketIo();
    socekt.IO = io;
    socekt.connect();
  }

  public listen() {
    this.httpServer.listen(this.port, () => {
      console.log(
        chalk.blue(
          `Server runs in http://${this.host}:${this.port} MODE ${this.Env}`
        )
      );
    });
  }
}
