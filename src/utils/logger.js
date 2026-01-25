import pino from 'pino'

// Configurar logger com pino
const logger = pino({
  level: import.meta.env.VITE_LOG_LEVEL || 'info',
  transport:
    import.meta.env.MODE === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: false,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
})

export default logger
