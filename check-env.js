// Simple script to check environment variables
const fs = require('fs');
const dotenv = require('dotenv');

// Load .env file
const envConfig = dotenv.parse(fs.readFileSync('.env'));

console.log('Environment variables from .env file:');
console.log(envConfig);

console.log('\nCurrent PORT value:', envConfig.PORT);
console.log('PORT value from process.env:', process.env.PORT);

console.log('\nTo fix the port conflict:');
console.log('1. Make sure your .env file has PORT=3002');
console.log('2. Make sure your SSO service is using PORT=3001');
console.log('3. Restart both services'); 