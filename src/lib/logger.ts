import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message, ...meta }) =>
        `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
    )
  ),
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  transports: [
    new winston.transports.Console(),
    // Puedes agregar más transportes (archivos, servicios externos, etc.)
  ],
});

export default logger;
