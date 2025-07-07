import { Auth0Provider } from '@auth0/auth0-react';
import ErrorBoundary from '@components/ErrorBoundary';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

// auth_config.js or useAuth.js
export const authConfig = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain={authConfig.domain}
      clientId={authConfig.clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </Auth0Provider>
  </React.StrictMode>
);