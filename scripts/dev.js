const concurrently = require('concurrently')
// const { resolve } = require('node:path')
const { result } = concurrently(
  [
    {
      command: 'pnpm --filter @time-app-test/backend dev',
      name: 'server',
      prefixColor: 'blue',
    },
    {
      command: 'pnpm --filter @time-app-test/frontend dev',
      name: 'web',
      prefixColor: 'green',
    },
  ],
  {
    prefix: 'name',
    restartTries: 3,
    // cwd: resolve(__dirname, 'scripts'),
  },
)
result.then()
