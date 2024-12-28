require('ts-node').register({
  project: './tsconfig.json',
  transpileOnly: true,
});
require('tsconfig-paths').register();
require('./scripts/create-admin.ts');