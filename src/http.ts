import { checkAppConfig, executeProviders, AppProvider, Application } from './app';
import { FormValidationError } from './validation';
import { Service, Context } from './service';
import { KeyValuePair, Store } from './misc';
import * as formidable from 'formidable';
import { File } from './filesystem';
import { Session } from './session';
import * as express from 'express';
import * as pathlib from 'path';
import * as bytes from 'bytes';
import * as http from 'http';
import * as os from 'os';
import * as fs from 'fs';

const STATUSES = require('statuses');
const qs = require('qs');

/**
 * Request interface
 */
export interface Request extends express.Request {

  /**
   * Contains parsed request body
   * @type {KeyValuePair<string>}
   */
  body: KeyValuePair<string>;

  /**
   * Session object
   * @type {Session}
   */
  session: Session;

  /**
   * Input object that contains parsed body and query string
   * @type {Input}
   */
  input: Input;

  /**
   * Make an instance of service
   * @param  {(new(...args: any[]) => U)} serviceClass
   * @return {U}
   */
  make<U extends Service>(serviceClass: new(...args: any[]) => U): U;

  /**
   * Context instance
   * @type {Context}
   */
  readonly context: Context;
}

/**
 * Install body parser
 * @param  {Application} app
 * @return {AppProvider}
 */
export function provideBodyParser(): AppProvider {
  return async (app: Application): Promise<void> => {
    checkAppConfig(app);

    let requestConf = app.config.get('request') || {};
    requestConf.encoding = requestConf.encoding || 'utf-8';
    requestConf.postMaxSize = requestConf.postMaxSize || '2MB';
    requestConf.uploadMaxSize = requestConf.uploadMaxSize || '5MB';
    requestConf.tmpUploadDir = requestConf.tmpUploadDir || os.tmpdir();

    if (!pathlib.isAbsolute(requestConf.tmpUploadDir)) {
      requestConf.tmpUploadDir = pathlib.join(app.dir, requestConf.tmpUploadDir);
    }

    let postMaxSize = bytes.parse(requestConf.postMaxSize);
    let uploadMaxSize = bytes.parse(requestConf.uploadMaxSize);

    app.use((req: Request, res: express.Response, next: Function) => {

      req.body = {};
      (req as any)._files = {};

      let form = new formidable.IncomingForm();
      form.encoding = requestConf.encoding;
      form.uploadDir = requestConf.tmpUploadDir;
      form.maxFieldsSize = postMaxSize;
      form.multiples = true;
      form.keepExtensions = true;

      form.parse(req, (err, fields, files) => {
        if (err) return next(err);

        if (fields) {
          req.body = qs.parse(fields);
        }

        let totalUploadSize = 0;
        if (files) {
          for (let key in files) {
            if (Array.isArray(files[key])) {

              (req as any)._files[key] = [];
              (req as any)._files[key].forEach((file: formidable.File) => {
                let uploaded = new UploadedFile(file);
                totalUploadSize += uploaded.size;
                (req as any)._files[key].push(uploaded);
              });

            } else {
              let uploaded = new UploadedFile(files[key]);
              totalUploadSize += uploaded.size;
              (req as any)._files[key] = uploaded;
            }
          }
        }

        if (totalUploadSize > uploadMaxSize) {
          return next(new Error('Reached upload max size'));
        }

        req.input = new Input(req);
        next();
      });
    });
  };
}

/**
 * Input class
 */
export class Input extends Store {

  /**
   * File input
   * @type {KeyValuePair<any>}
   */
  private fileInput: KeyValuePair<any>;

  /**
   * Input constructor
   * @param {Request} private req
   */
  constructor(private req: Request) {
    super();
    let content = {};
    switch (req.method) {
      case 'GET':
      case 'DELETE':
        content = this.req.query || (this.req as any)._query;
        break;
      default:
        content = this.req.body;
        break;
    }
    this.content = content;
    this.fileInput = (this.req as any)._files || {};
  }

  /**
   * Get input except for specified fields
   * @param  {string[]} exception
   * @return {KeyValuePair<any>}
   */
  public except(exception: string[]): KeyValuePair<any> {
    let values: KeyValuePair<string> = {};
    let allInput = this.all();
    if (typeof allInput == 'object') {
      for (let field in allInput) {
        if (exception.indexOf(field) == -1) {
          values[field] = allInput[field];
        }
      }
    }
    return values;
  }

  /**
   * Get input only for specified fields
   * @param  {string[]} fields
   * @return {KeyValuePair<any>}
   */
  public only(fields: string[]): KeyValuePair<any> {
    let values: KeyValuePair<string> = {};
    for (let field of fields) {
      let value = this.get(field);
      if (typeof value != 'undefined') {
        values[field] = value;
      }
    }
    return values;
  }

  /**
   * Has file
   * @param  {string} key
   * @return {boolean}
   */
  public hasFile(key: string): boolean {
    return this.file(key) ? true : false;
  }

  /**
   * Get input file
   * @param  {string} key
   * @return {UploadedFile}
   */
  public file(key: string): UploadedFile | undefined {
    if (!this.fileInput || !this.fileInput[key]) return;
    if (Array.isArray(this.fileInput[key])) {
      return this.fileInput[key][0];
    }
    return this.fileInput[key];
  }

  /**
   * Get input files
   * @param  {string} key
   * @return {UploadedFile[]}
   */
  public files(key: string): UploadedFile[] | undefined {
    if (!this.fileInput || !this.fileInput[key]) return;
    if (!Array.isArray(this.fileInput[key])) {
      return [this.fileInput[key]];
    }
    return this.fileInput[key];
  }
}

/**
 * UploadedFile class
 */
export class UploadedFile extends File {

  /**
   * Flag if uploaded file is already moved to another location
   * @type {boolean}
   */
  private moved: boolean = false;

  /**
   * Flag if uploaded file is currently in process
   * @type {boolean}
   */
  private processing: boolean = false;

  /**
   * UploadedFile constructor
   * @param {formidable.File} uploaded
   */
  constructor(uploaded: formidable.File) {
    super({
      name: uploaded.name,
      path: uploaded.path,
      type: uploaded.type,
      hash: uploaded.hash,
      size: uploaded.size,
      lastModifiedDate: uploaded.lastModifiedDate
    });
  }

  /**
   * Get JSON Object
   * @return {KeyValuePair<any>}
   */
  public toJSON(): KeyValuePair<any> {
    return {
      name: this.name,
      path: this.path,
      type: this.type,
      hash: this.hash,
      size: this.size,
      lastModifiedDate: this.lastModifiedDate
    };
  }

  /**
   * Check availability of file for processing
   */
  public isMovedOrInProcess(): boolean {
    return this.moved || this.processing;
  }

  /**
   * Move uploaded file
   * @param  {string} destination
   * @param  {string} fileName
   * @return {Promise<boolean>}
   */
  public move(destination: string, fileName?: string): Promise<boolean> {
    if (this.isMovedOrInProcess()) {
      throw new Error('File is already moved or in process');
    }

    this.processing = true;
    destination = pathlib.join(destination, fileName || this.name);
    return new Promise<boolean>((resolve, reject) => {

      fs.rename(this.path, destination, err => {
        this.processing = false;

        if (err) {
          return reject(err);
        }

        this.name = pathlib.basename(destination);
        this.path = pathlib.resolve(destination);
        this.moved = true;

        resolve(true);
      });
    });
  }

  /**
   * Delete temporary file
   * @return {Promise<boolean>}
   */
  public deleteTempFile(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {

      if (this.isMovedOrInProcess()) {
        return resolve(false);
      }

      fs.unlink(this.path, err => {

        if (err) return reject(err);
        resolve(true);
      });
    });
  }
}

/**
 * Response interface
 */
export interface Response extends express.Response {}

/**
 * Start HTTP Server
 * @param  {Application} app
 * @param  {AppProvider[]} providers
 * @return {Promise<Application>}
 */
export function startServer(app: Application, providers: AppProvider[]): Promise<Application> {
  checkAppConfig(app);

  app.disable('x-powered-by');
  app.disable('strict routing');
  app.enable('case sensitive routing');

  app.use((req: Request, res: Response, next: express.NextFunction) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  return new Promise<Application>((resolve, reject) => {
    executeProviders(app, providers)
      .then(() => {

        let server = http.createServer(app);
        server.on('error', err => reject(err));
        server.on('listening', () => {
          let addr = server.address();
          let bind = typeof addr == 'string' ? `pipe ${addr}` : `port ${addr.port}`;
          console.log(`Listening on ${bind}`);
          resolve(app);
        });

        server.listen(app.config.get('app.port'));
      })
      .catch(err => reject(err));
  });
}

/**
 * HttpError class
 */
export class HttpError extends Error {

  /**
   * HttpError constructor
   * @param {number} statusCode
   * @param {string} message
   */
  constructor(public statusCode: number, message?: string) {
    super(message || STATUSES[statusCode]);
    if (statusCode < 400) {
      throw new Error('HttpError only accepts status codes greater than 400');
    }
    if (!STATUSES[statusCode]) {
      throw new Error('HttpError invalid status code');
    }
  }
}

/**
 * Provide HTTP error handler
 * @return {AppProvider}
 */
export function provideHttpErrorHandler(): AppProvider {
  return async (app: Application): Promise<void> => {
    app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {

      let details: any = {
        name: err.name,
        message: err.message,
      };

      if (app.config.get('app.env') != 'production') {
        details.stack = err.stack;
      }

      if (err instanceof FormValidationError) {
        details.fields = err.fields;
        res.status(400);
      } else if (err instanceof HttpError) {
        res.status(err.statusCode);
      } else {
        res.status(500);
      }

      if (req.accepts('json')) {
        res.json({ error: details });
      } else if (req.accepts('html')) {
        res.render(`errors/${res.statusCode}`, { error: details });
      } else {
        res.send(JSON.stringify(details));
      }
    });
  };
}
