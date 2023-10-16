# GitHub OAuth2 CORS Middleware

GitHub OAuth2 process can not be completed in a client-side only application
(browser extension) because of the CORS restrictions on the
github.com/login/oauth/access_token API endpoint.

That restriction was put in place for security purposes (to not expose the
client_secret in the JavaScript code running on the client).

The solution is to setup a server that would call that endpoint with the
client_secret and return the access_token to the client.

## Deployment

### Development

1. Copy [./example.env.local](./example.env.local) into `.env.local` and fill it
   in according to instructions in that file.
2. Run `npm install`
3. Run `npm run dev` to start the development server
4. The server will be accessible on the `http://localhost:3000` address.

   Note, if you try to open this URL in the browser, you will see a 405 error -
   that is expected, as the server only accepts POST requests.

   Copy this URL as it will be needed later.

### Production

1. Create new vercel.com project from this repository
2. Change the "Root Directory" setting to current directory
   (./auth-cors-middleware)
3. Set up the environmental variables according to the instructions in the
   `example.env.local` file
4. Keep note of the URL at which the project is deployed - you will need it
   later
