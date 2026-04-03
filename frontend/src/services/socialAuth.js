


























let googleTokenClient;

async function fetchGoogleProfile(accessToken) {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Google profile');
  }

  return response.json();
}

export async function triggerGoogleOAuth() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error('Missing VITE_GOOGLE_CLIENT_ID in frontend .env');
  }

  if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
    throw new Error('Google OAuth SDK not loaded. Restart Vite after updating frontend .env.');
  }

  return new Promise((resolve, reject) => {
    googleTokenClient ??= window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: async (tokenResponse) => {
        if (tokenResponse.error || !tokenResponse.access_token) {
          reject(new Error(tokenResponse.error_description || 'Google sign-in failed'));
          return;
        }

        try {
          const profile = await fetchGoogleProfile(tokenResponse.access_token);
          resolve({
            googleId: profile.sub,
            name: profile.name,
            email: profile.email,
            avatar: profile.picture
          });
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Failed to read Google profile'));
        }
      },
      error_callback: () => {
        reject(new Error('Google sign-in popup was closed or blocked'));
      }
    });

    googleTokenClient.requestAccessToken({ prompt: 'select_account' });
  });
}

export async function triggerFacebookOAuth() {
  if (typeof window !== 'undefined' && window.FB) {
    return new Promise((resolve, reject) => {
      window.FB.login((response) => {
        if (response.authResponse) {
          window.FB.api('/me', { fields: 'id,name,email,picture' }, (user) => {
            resolve({
              facebookId: user.id,
              name: user.name,
              email: user.email,
              avatar: user.picture?.data?.url
            });
          });
        } else {
          reject(new Error('Facebook login was cancelled'));
        }
      }, { scope: 'email,public_profile' });
    });
  }

  throw new Error('Facebook SDK not loaded. Add your VITE_FACEBOOK_APP_ID to frontend .env and restart Vite.');
}