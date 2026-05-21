const admin = require('firebase-admin');

let serviceAccount;
let initError = null;
let initSuccess = false;

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
    initError = `JSON parse failed: ${err.message}`;
  }
}

// Fallback to local serviceAccountKey.json file (local development)
if (!serviceAccount && !initError) {
  try {
    serviceAccount = require('./serviceAccountKey.json');
  } catch (err) {
    console.warn('Firebase serviceAccountKey.json not found, and FIREBASE_SERVICE_ACCOUNT environment variable is not set. Social logins will fail.');
    initError = 'Credentials not found (local file missing and environment variable empty)';
  }
}

if (serviceAccount) {
  // Replace escaped newline characters in private_key if present
  if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
    let key = serviceAccount.private_key.trim();
    
    // 1. If Vercel wrapped the key in quotes, strip them
    if (key.startsWith('"') && key.endsWith('"')) {
      key = key.slice(1, -1);
    }
    
    // 2. Replace all forms of escaped newlines (e.g. \\n, \n, or raw newline placeholders) with actual newlines
    key = key.replace(/\\n/g, '\n');
    key = key.replace(/\\u000a/g, '\n');
    
    // 3. Log a safe format check in Vercel logs to make it easy to debug
    const hasBegin = key.includes('-----BEGIN PRIVATE KEY-----');
    const hasEnd = key.includes('-----END PRIVATE KEY-----');
    console.log(`[Firebase Init] Key check: Length=${key.length}, hasBegin=${hasBegin}, hasEnd=${hasEnd}`);
    
    serviceAccount.private_key = key;
  }
  
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('[Firebase Init] Firebase Admin SDK successfully initialized.');
    initSuccess = true;
  } catch (err) {
    console.error('[Firebase Init] Failed to initialize Firebase Admin:', err.message);
    initError = err.message;
  }
} else if (!initError) {
  initError = 'No Firebase service account credentials provided';
}

// Export initialization status along with the admin instance
admin.$initStatus = {
  success: initSuccess,
  error: initError,
  hasEnv: !!process.env.FIREBASE_SERVICE_ACCOUNT
};

module.exports = admin;