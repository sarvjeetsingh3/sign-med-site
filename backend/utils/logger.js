const colors = {
  reset: '\x1b[0m',
  cyan:  '\x1b[36m',
  green: '\x1b[32m',
  red:   '\x1b[31m',
  yellow:'\x1b[33m',
  blue:  '\x1b[34m',
  gray:  '\x1b[90m',
};

const timestamp = () => {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
};

const logger = {
  info:    (msg) => console.log(`${colors.cyan}[INFO]${colors.reset}  ${colors.gray}${timestamp()}${colors.reset}  ${msg}`),
  success: (msg) => console.log(`${colors.green}[OK]${colors.reset}    ${colors.gray}${timestamp()}${colors.reset}  ${msg}`),
  warn:    (msg) => console.log(`${colors.yellow}[WARN]${colors.reset}  ${colors.gray}${timestamp()}${colors.reset}  ${msg}`),
  error:   (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${colors.gray}${timestamp()}${colors.reset}  ${msg}`),
  request: (method, url, status, ms) => {
    const color = status >= 500 ? colors.red : status >= 400 ? colors.yellow : colors.green;
    console.log(`${colors.blue}[REQ]${colors.reset}   ${colors.gray}${timestamp()}${colors.reset}  ${method.padEnd(6)} ${url.padEnd(30)} ${color}${status}${colors.reset} ${colors.gray}${ms}ms${colors.reset}`);
  }
};

module.exports = logger;