import  _multer from "multer";
import { NextFunction, Response } from "express";
import  multerS3 from "multer-s3";
import * as aws from "aws-sdk";
import config from "../configs/config";
import ServerError from "../errors/serverError";
import { eMessages } from "../utils/constants/eMessages";
import { IMulterStorage } from "../interfaces/multer.interface";
import * as _ from "lodash";
import * as fs from "fs";
import { sendError } from "../utils/helpers/response";

export default class Multer {
  private uploadLimit(limit: string): number {
    const limitArr = limit.split("-");
    const size = {
      m: (s) => s * 1024 * 1024,
      k: (s) => s * 1024,
    };
    return size[limitArr[1]](parseInt(limitArr[0]));
  }

  private multer(mimetype, options: IMulterStorage) {
    return _multer({
      storage: options.storage,
      fileFilter(
        req,
        file: Express.Multer.File,
        callback: _multer.FileFilterCallback
      ) {
        if (mimetype) {
          !_.has(mimetype, file.mimetype)
            ? callback(new ServerError(eMessages.FILE_TYPE_NOT_ACCEPTABLE))
            : callback(null, true);
        } else {
          callback(new ServerError(eMessages.MIME_TYPE_NOT_PROVIDE));
        }
      },
      limits: {
        fileSize: this.uploadLimit(mimetype.size),
      },
    });
  }

  private uploadS3(fileName: string, mimetype) {
    //TODO : upload to s3. configs not completed yet
    return this.multer(mimetype, {
      storage: multerS3({
        s3: new aws.S3(config.aws.config),
        acl: "public-read",
        bucket: "bucket-name",
        metadata: (req, file, cb) => {
          cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
          // cb(null, this.makeFileName(fileName))
        },
      }),
    });
  }

  /**
   * upload file to this server
   * @param {string} fileName - name for file to save with this name
   * @param {Object} mimetype - mimetype fo validate file types
   * @return {multer} returns multer object
   * */
  private uploadHere(fileName: string, mimetype) {
    const makeFileName = this.makeFileName;
    const makeDist = this.makeDist;
    const uploadConfig = config.uploadHere;
    return this.multer(mimetype, {
      storage: _multer.diskStorage({
        destination: function (req, file, cb) {
          cb(
            null,
            makeDist(
              uploadConfig.rootDist,
              req.user["id"],
              file.mimetype,
              mimetype
            )
          );
        },
        filename: function (req, file, cb) {
          cb(null, makeFileName(fileName, file.mimetype, mimetype));
        },
      }),
    });
  }

  private uploadServer() {
    return this.multer(null, null);
  }

  /**
   * create string for file name
   * @param {string} fileName - name for uploaded file like (avatar.jpg only avatar)
   * @param fileMimetype
   * @param mimetypes
   * @return {string} return name
   * */
  private makeFileName(
    fileName: string,
    fileMimetype: string,
    mimetypes
  ): string {
    return `${fileName}-${Date.now().toString()}.${mimetypes[fileMimetype].extension
      }`;
  }

  /**
   * create string for file name
   * @param {string} rootFolder - root folders come from configs like uploads
   * @param {string} user - user id for sub folder every data of user go to this folder
   * @param fileMimetype
   * @param mimetypes
   * @param host
   * @param port
   * @example  uploads/1012/avatar/
   * @return {string} return directory name
   * */
  private makeDist(
    rootFolder: string,
    user: string,
    fileMimetype: string,
    mimetypes
  ): string {
    const path = `${rootFolder}/user-${user}${mimetypes[fileMimetype].address}`;
    fs.mkdirSync(path, { recursive: true });
    return path;
  }

  private handelError(res: Response, err) {
    if (err.code === "LIMIT_FILE_SIZE")
      err.code = eMessages.FILE_TYPE_NOT_ACCEPTABLE.code;
    sendError(res)(err);
  }

  /**
   * upload single file and choose server to upload
   * @param {string} fileName - file saved by this name
   * @param {string} filedName - the filedName in req.file
   * @param {Object} mimetype - mimetype fo validate file types
   * */
  public uploadSingle = (fileName, filedName, mimetype) => (req, res, next) => {
    if (config.aws.publishS3)
      return this.uploadS3(fileName, mimetype).single(filedName)(
        req,
        res,
        (err) => {
          if (err) return this.handelError(res, err);
          req.file.url = config.aws.url + req.file.path;
          next();
        }
      );

    if (config.uploadServer.publishToUploadServer)
      return this.uploadServer().single(filedName)(req, res, (err) => {
        if (err) return this.handelError(res, err);
        req.file.url = config.uploadServer.url + req.file.path;
        next();
      });

    if (config.uploadHere.publishHere)
      return this.uploadHere(fileName, mimetype).single(filedName)(
        req,
        res,
        (err) => {
          if (err) return this.handelError(res, err);
          if (req.file)
            req.file.url = config.uploadHere.url + req.file.path;
          next();
        }
      );
  };
}
