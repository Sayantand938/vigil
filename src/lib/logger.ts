// src/lib/logger.ts
type LogEntry = {
    timestamp: string;
    level: 'log' | 'info' | 'warn' | 'error';
    args: any[];
};

class Logger {
    private static instance: Logger;
    private logs: LogEntry[] = [];
    private maxLogs = 1000;
    private originalConsole = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
    };

    private constructor() {
        this.overrideConsole();
        this.setupGlobalErrorHandlers();
    }

    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private overrideConsole() {
        const self = this;
        console.log = function (...args) {
            self.addLog('log', args);
            self.originalConsole.log(...args);
        };
        console.info = function (...args) {
            self.addLog('info', args);
            self.originalConsole.info(...args);
        };
        console.warn = function (...args) {
            self.addLog('warn', args);
            self.originalConsole.warn(...args);
        };
        console.error = function (...args) {
            self.addLog('error', args);
            self.originalConsole.error(...args);
        };
    }

    private setupGlobalErrorHandlers() {
        window.addEventListener('error', (event) => {
            console.error('Uncaught error:', event.error);
        });
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled rejection:', event.reason);
        });
    }

    private addLog(level: LogEntry['level'], args: any[]) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            args: args.map(arg => {
                if (arg instanceof Error) {
                    return { message: arg.message, stack: arg.stack };
                }
                if (typeof arg === 'object' && arg !== null) {
                    try {
                        return JSON.parse(JSON.stringify(arg));
                    } catch {
                        return String(arg);
                    }
                }
                return arg;
            }),
        };
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
    }

    getLogs(): LogEntry[] {
        return this.logs;
    }

    getLogsString(): string {
        return this.logs.map(entry => {
            const argsStr = entry.args.map(arg => {
                if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg);
                    } catch {
                        return String(arg);
                    }
                }
                return String(arg);
            }).join(' ');
            return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${argsStr}`;
        }).join('\n');
    }

    clear() {
        this.logs = [];
    }

    restore() {
        console.log = this.originalConsole.log;
        console.info = this.originalConsole.info;
        console.warn = this.originalConsole.warn;
        console.error = this.originalConsole.error;
    }
}

export const logger = Logger.getInstance();