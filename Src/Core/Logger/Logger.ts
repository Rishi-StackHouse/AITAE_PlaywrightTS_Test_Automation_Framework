// Pino-backed logger. Same interface (error/warn/info/debug) so callers don't change.
import pino from 'pino';
import pretty from 'pino-pretty';
import fs from 'fs';
import path from 'path';

// Level set by LOG_LEVEL (default info).
const LEVEL = (process.env.LOG_LEVEL ?? 'info').toLowerCase();

// Root folder for all log files: <workspace>/Artifacts/Logs
const LOGS_ROOT = path.resolve(process.cwd(), 'Artifacts', 'Logs');

export class Logger {
    // A child logger carrying the module tag, e.g. [LoginPage].
    private readonly logger: pino.Logger;

    // `namespace` doubles as the console tag and the log sub-folder.
    // e.g. 'Orge/LoginPage' -> console tag [LoginPage], file Artifacts/Logs/Orge/LoginPage/<timestamp>.log
    constructor(namespace = 'App') {
        const tag = namespace.split('/').pop() || namespace;

        // Build and ensure the per-namespace log folder exists.
        const logDir = path.join(LOGS_ROOT, namespace);
        fs.mkdirSync(logDir, { recursive: true });

        // One timestamped file per logger instance (filesystem-safe name).
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const logFile = path.join(logDir, `${timestamp}.log`);

        // Console stream (colorized) + file stream (plain). Both synchronous.
        const consoleStream = pretty({
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname,module',
            messageFormat: '[{module}] {msg}',
            sync: true,
        });
        const fileStream = pretty({
            colorize: false,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname,module',
            messageFormat: '[{module}] {msg}',
            sync: true,
            destination: pino.destination({ dest: logFile, sync: true, mkdir: true }),
        });

        const baseLogger = pino(
            { level: LEVEL },
            pino.multistream([{ stream: consoleStream }, { stream: fileStream }]),
        );

        this.logger = baseLogger.child({ module: tag });
    }

    error(message: string, meta?: unknown): void {
        this.logger.error(meta ?? {}, message);
    }

    warn(message: string, meta?: unknown): void {
        this.logger.warn(meta ?? {}, message);
    }

    info(message: string, meta?: unknown): void {
        this.logger.info(meta ?? {}, message);
    }

    debug(message: string, meta?: unknown): void {
        this.logger.debug(meta ?? {}, message);
    }
}
