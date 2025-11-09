import { config } from 'dotenv';
config({ path: '.env.local' });
// eslint-disable-next-line no-console
console.log('TENANT_BUSINESS_NAME=', process.env.TENANT_BUSINESS_NAME);
