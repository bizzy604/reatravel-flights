// Simple logger utility for consistent logging across the application

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogData {
  message: string
  level: LogLevel
  timestamp: string
  [key: string]: any
}

class Logger {
  private logToConsole(data: LogData) {
    const { level, message, timestamp, ...rest } = data

    // Format the log message
    const formattedMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`

    // Log to console with appropriate method
    switch (level) {
      case "debug":
        console.debug(formattedMessage, Object.keys(rest).length ? rest : "")
        break
      case "info":
        console.info(formattedMessage, Object.keys(rest).length ? rest : "")
        break
      case "warn":
        console.warn(formattedMessage, Object.keys(rest).length ? rest : "")
        break
      case "error":
        console.error(formattedMessage, Object.keys(rest).length ? rest : "")
        break
    }
  }

  private createLogEntry(level: LogLevel, message: string, data?: Record<string, any>): LogData {
    return {
      message,
      level,
      timestamp: new Date().toISOString(),
      ...data,
    }
  }

  debug(message: string, data?: Record<string, any>) {
    if (process.env.NODE_ENV !== "production") {
      const logEntry = this.createLogEntry("debug", message, data)
      this.logToConsole(logEntry)
    }
  }

  info(message: string, data?: Record<string, any>) {
    const logEntry = this.createLogEntry("info", message, data)
    this.logToConsole(logEntry)
  }

  warn(message: string, data?: Record<string, any>) {
    const logEntry = this.createLogEntry("warn", message, data)
    this.logToConsole(logEntry)
  }

  error(message: string, data?: Record<string, any>) {
    const logEntry = this.createLogEntry("error", message, data)
    this.logToConsole(logEntry)

    // In a production environment, you might want to send errors to an error tracking service
    // like Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === "production" && process.env.ERROR_TRACKING_ENABLED === "true") {
      // Example: Sentry.captureException(data?.error || new Error(message));
    }
  }
}

export const logger = new Logger()

