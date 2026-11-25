// Step files import app code from src/ (e.g. the HAL client). Compile it as CommonJS
// so Node resolves extensionless imports like "./apiError".
process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({ module: 'commonjs', moduleResolution: 'node' });

module.exports = {
  default: {
    paths: ['tests/e2e/**/*.feature'],
    format: ['pretty', 'json:playwright-report/results.json', 'html:playwright-report/results.html'],
    require: ['tests/e2e/support/**/*.ts', 'tests/e2e/steps/**/*.steps.ts'],
    requireModule: ['ts-node/register'],
  },
};
