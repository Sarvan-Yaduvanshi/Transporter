const admin = require('firebase-admin');

let serviceAccount;
let initError = null;
let initSuccess = false;
let keyDiagnostics = null;

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
  if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
    let key = serviceAccount.private_key;
    
    // Log diagnostics before any sanitization
    const preLength = key.length;
    const preHasBegin = key.includes('-----BEGIN PRIVATE KEY-----');
    const preHasEnd = key.includes('-----END PRIVATE KEY-----');
    const preBackslashN = (key.match(/\\n/g) || []).length;
    const preRealN = (key.match(/\n/g) || []).length;
    
    // Sanitization steps
    let cleanedKey = key.trim();
    if (cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) {
      cleanedKey = cleanedKey.slice(1, -1);
    }
    cleanedKey = cleanedKey.replace(/\\n/g, '\n');
    cleanedKey = cleanedKey.replace(/\\u000a/g, '\n');
    
    const postLength = cleanedKey.length;
    const postHasBegin = cleanedKey.includes('-----BEGIN PRIVATE KEY-----');
    const postHasEnd = cleanedKey.includes('-----END PRIVATE KEY-----');
    const postRealN = (cleanedKey.match(/\n/g) || []).length;
    
    // Obfuscate key to inspect exact structure safely:
    // Keep exact newlines, spaces, dashes, but mask all alphanumeric characters with 'x' or '0'
    const obfuscated = cleanedKey
      .replace(/[a-zA-Z]/g, 'x')
      .replace(/[0-9]/g, '0');
    
    keyDiagnostics = {
      pre: {
        length: preLength,
        hasBegin: preHasBegin,
        hasEnd: preHasEnd,
        backslashNCount: preBackslashN,
        realNewlineCount: preRealN
      },
      post: {
        length: postLength,
        hasBegin: postHasBegin,
        hasEnd: postHasEnd,
        realNewlineCount: postRealN
      },
      obfuscatedStructure: obfuscated
    };
    
    serviceAccount.private_key = cleanedKey;
  } else {
    keyDiagnostics = {
      error: 'private_key property is missing or not a string'
    };
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
  hasEnv: !!process.env.FIREBASE_SERVICE_ACCOUNT,
  keyDiagnostics: keyDiagnostics
};

module.exports = admin;