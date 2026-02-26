import {Logger} from 'tslog';

export const logger = new Logger({
    name: 'Selene',
    type: 'pretty',
    minLevel: process.env.LOG_LEVEL === 'debug' ? 0 : 2, // 0=silly, 2=info
    prettyLogTemplate: '{{yyyy}}-{{mm}}-{{dd}} {{hh}}:{{MM}}:{{ss}} {{logLevelName}}\t[{{name}}] ',
});
