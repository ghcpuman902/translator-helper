import express, { Application } from "express";
import { createServer as createHTTPServer, Server as HTTPServer } from "http";
import path from "path";

export class Server {
    private httpServer: HTTPServer;

    private app: Application;

    private readonly DEFAULT_PORT = 5000;

    private activeSockets: string[] = [];

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        this.app = express();

        this.httpServer = createHTTPServer(this.app);

        this.configureApp();
    }

    private configureApp(): void {
        this.app.use(express.static(path.join(__dirname, "../public")));
    }

    public listen(callback: (port: number) => void): void {
        this.httpServer.listen(this.DEFAULT_PORT, () =>
            callback(this.DEFAULT_PORT)
        );
    }
 
}