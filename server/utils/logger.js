// server/utils/logger.js
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  };
  
  class Logger {
    constructor() {
      this.environment = process.env.NODE_ENV || 'development';
    }
  
    formatMessage(level, message, meta = {}) {
      return {
        timestamp: new Date().toISOString(),
        level,
        environment: this.environment,
        ...meta,
        message
      };
    }
  
    error(message, meta = {}) {
      console.error(JSON.stringify(this.formatMessage('error', message, meta)));
    }
  
    warn(message, meta = {}) {
      console.warn(JSON.stringify(this.formatMessage('warn', message, meta)));
    }
  
    info(message, meta = {}) {
      console.info(JSON.stringify(this.formatMessage('info', message, meta)));
    }
  
    debug(message, meta = {}) {
      if (this.environment === 'development') {
        console.debug(JSON.stringify(this.formatMessage('debug', message, meta)));
      }
    }
  }
  
  export default new Logger();