import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="492629292714-a2ogqovpojt02phkiovto1iep5moatd5.apps.googleusercontent.com">
    <App />
    </GoogleOAuthProvider>
  </StrictMode>
)
