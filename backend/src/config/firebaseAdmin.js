const admin = require('firebase-admin');

let serviceAccount;

// Check if Firebase Service Account credentials are provided as an environment variable (standard for Vercel/Production)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    // Check if it's a stringified JSON or a base64 encoded string
    const decoded = process.env.FIREBASE_SERVICE_ACCOUNT.trim().startsWith('{')
      ? process.env.FIREBASE_SERVICE_ACCOUNT
      : Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8');
    
    serviceAccount = JSON.parse(decoded);
  } catch (err) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT environment variable:', err.message);
  }
}

// Fallback to local serviceAccountKey.json file (local development)
if (!serviceAccount) {
  try {
    serviceAccount = require('./serviceAccountKey.json');
  } catch (err) {
    console.warn('Firebase serviceAccountKey.json not found, and FIREBASE_SERVICE_ACCOUNT environment variable is not set. Social logins will fail.');
  }
}

if (serviceAccount) {
  // Replace escaped newline characters in private_key if present
  if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  console.warn('Firebase Admin SDK was not initialized due to missing credentials.');
}

module.exports = admin;