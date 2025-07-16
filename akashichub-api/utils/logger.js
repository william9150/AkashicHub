import winston from "winston";
import { SeqTransport } from "@datalust/winston-seq";

const transports = [
  new winston.transports.Console({
    format: winston.format.simple(),
  }),
];

// 只有在 SEQ_ENABLED 為 true 時才添加 Seq transport
if (process.env.SEQ_ENABLED === 'true') {
  transports.push(
    new SeqTransport({
      serverUrl: process.env.SEQ_URL || "http://localhost:5341",
      apiKey: process.env.SEQ_API_KEY || "",
      onError: (e) => {
        console.error(e);
      },
      handleExceptions: true,
      handleRejections: true,
    })
  );
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    /* This is required to get errors to log with stack traces. See https://github.com/winstonjs/winston/issues/1498 */
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    /* application: 'your-app-name' */
  },
  transports: transports,
});

export default logger;
