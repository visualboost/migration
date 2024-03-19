const {transports, createLogger, format} = require('winston');

const console = new transports.Console();

const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [

    ],
});


module.exports.logError = (target, msg) => {
    const logFile = new transports.File({ filename: `./logs/${target.name}_error.log` });
    logger.clear();
    logger.add(console);
    logger.add(logFile);
    logger.error(msg);
}

module.exports.logInfo = (target, msg) => {
    const logFile = new transports.File({ filename: `./logs/${target.name}.log` });
    logger.clear();
    logger.add(console);
    logger.add(logFile);
    logger.info(msg);
}