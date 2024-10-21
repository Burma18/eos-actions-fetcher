import { config } from 'dotenv';
import * as env from 'env-var';

config();
export const environment = {
  app: {
    port: env.get('PORT').required().default('5000').asPortNumber(),
    env: env.get('NODE_ENV').required().default('dev').asString(),
    prefix: env.get('PREFIX').default('api').asString(),
  },
  database: {
    mongoUrl: env.get('MONGO_URL').required().asString(),
  },
};
