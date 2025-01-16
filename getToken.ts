// get-token.ts
import express from 'express';
import http from 'http';
import { writeFileSync } from 'fs';

const port = 12121;
const CONFIG = {
  issuerUrl: 'http://localhost:29091',
  clientId: 'testServer', // You'll need to provide this
  scopes: ['offline_access'], // You'll need to provide this
  redirect: `http://localhost:${port}/redirect`,
};

const app = express();

app.use(express.urlencoded());
app.use(express.json());

async function getToken(): Promise<void> {
  const client = await import('openid-client');
  // Discover OIDC endpoints
  const oidcConfig = await client.discovery(
    new URL(CONFIG.issuerUrl),
    CONFIG.clientId,
    {},
    (x) => x,
    { execute: [client.allowInsecureRequests] }
  );

  const code_verifier = client.randomPKCECodeVerifier();
  let state!: string;

  app.get('/redirect', async (req, res) => {
    const url = new URL(req.protocol + '://' + req.hostname + req.url);
    const tokens = await client.authorizationCodeGrant(oidcConfig, url, {
      pkceCodeVerifier: code_verifier,
      expectedState: state,
    });
    console.log('Tokens', tokens);

    // Save access token to file
    writeFileSync('access-token.dat', tokens.access_token);
    console.log('Token saved to access-token.dat');

    res.json(tokens);

    process.exit(0);
  });

  http.createServer(app).listen(port, () => {
    console.log(
      `Looking for redirects to generate tokens at http://localhost:${port}/redirect`
    );
  });

  try {
    // Start device authorization flow
    let code_challenge: string = await client.calculatePKCECodeChallenge(
      code_verifier
    );

    let parameters: Record<string, any> = {
      redirect_uri: CONFIG.redirect,
      scopes: CONFIG.scopes,
      code_challenge,
      code_challenge_method: 'S256',
    };

    if (!oidcConfig.serverMetadata().supportsPKCE()) {
      /**
       * We cannot be sure the server supports PKCE so we're going to use state too.
       * Use of PKCE is backwards compatible even if the AS doesn't support it which
       * is why we're using it regardless. Like PKCE, random state must be generated
       * for every redirect to the authorization_endpoint.
       */
      state = client.randomState();
      parameters.state = state;
    }

    let redirectTo: URL = client.buildAuthorizationUrl(oidcConfig, parameters);

    console.log('Please visit:', redirectTo.toString());

    await fetch(redirectTo);
    console.log('TOKEN SAVED!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

getToken();
