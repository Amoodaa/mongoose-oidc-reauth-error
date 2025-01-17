## Repro for mongoose bug where it cannot trigger re-auth flow

This bug caused us downtime on all of our non-critical services,

All our services worked fine, then default 3600s for a token to expire kicked in, causing our services to lose their connection with DB

I've spent 2 days working this out, between reading mongodb driver specs, mongodb/node-mongodb-native, mongodb-js/dev-tools and here's the reproduction

While i do understand that maybe my test setup is not ideal, because it does not ask a local command, just like the GCP workflow to generate a new access token, i believe this can be modified to maybe expose the problem, or at least might show that the problem is the GCP machine workflow is not requesting a new access token consistently, this local setup will be helpful to debugging this problem i think.

I am unsure of how to support the "refresh_token" in this flow, as it is not a Human workflow, and all machine workflows are not refresh-token friendly

Let me know what can i do next

### How to setup and run

- start by running `yarn`
- then:
  - `yarn compile:mock-provider`
    > this will compile my version of the [@mongodb-js/oidc-mock-provider](https://www.npmjs.com/package/@mongodb-js/oidc-mock-provider) and put it next to Dockerfile to copy it
  - `yarn docker:oidc-mongodb-server`
    > this will setup the docker file shallow cloned from [mongodb-js/devtools-docker-test-envs](https://github.com/mongodb-js/devtools-docker-test-envs) repo
  - `yarn oidc:get-token`
    > this will communicate with servers once docker is up, create a token and put it in a file called `access-token.dat` this token lives for 30s or as set in [this file:6](./docker-test-envs/docker/oidc/mock-oidc-provider/oidc-mock-provider.js)
  - `yarn dev`
    > this will run the test mongoose server which will expose the error after the token expires per the time set in the previous step

### How to reproduce and get the error

- `yarn oidc:get-token` you start counting seconds since you ran this command
- `yarn dev`
- open http://localhost:8080, you can keep refreshing until the token expires
- wait 30s for for setInterval to execute a command that will error, you will now see the error:

```
MongoServerError: Command insert requires reauthentication since the current authorization session has expired. Please re-auth.
    at Connection.sendCommand (D:\code\mongoose-8-8-type-error\node_modules\mongodb\src\cmap\connection.ts:545:17)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
    at Connection.command (D:\code\mongoose-8-8-type-error\node_modules\mongodb\src\cmap\connection.ts:617:22)
    at Server.command (D:\code\mongoose-8-8-type-error\node_modules\mongodb\src\sdam\server.ts:350:23)
    at InsertOneOperation.executeCommand (D:\code\mongoose-8-8-type-error\node_modules\mongodb\src\operations\command.ts:179:12)
    at InsertOneOperation.execute (D:\code\mongoose-8-8-type-error\node_modules\mongodb\src\operations\insert.ts:54:12)
    at InsertOneOperation.execute (D:\code\mongoose-8-8-type-error\node_modules\mongodb\src\operations\insert.ts:84:17)
    at tryOperation (D:\code\mongoose-8-8-type-error\node_modules\mongodb\src\operations\execute_operation.ts:278:14)
    at executeOperation (D:\code\mongoose-8-8-type-error\node_modules\mongodb\src\operations\execute_operation.ts:112:12)
    at Collection.insertOne (D:\code\mongoose-8-8-type-error\node_modules\mongodb\src\collection.ts:284:12)
[ERROR] 18:08:56 MongoServerError: Command insert requires reauthentication since the current authorization session has expired. Please re-auth.
```

But the error returns are inconsistent, i also get the following error more than the previous one, could this be a sign of a race condition?
These error originate from the same error stacktrace which is interesting

```
MongoServerError: Authentication failed.
    at Connection.sendCommand (D:\code\mongoose-8-8-type-error\node_modules\mongodb\src\cmap\connection.ts:545:17)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
    at Connection.command (D:\code\mongoose-8-8-type-error\node_modules\mongodb\src\cmap\connection.ts:617:22)
    at TokenMachineWorkflow.execute (D:\code\mongoose-8-8-type-error\node_modules\mongodb\src\cmap\auth\mongodb_oidc\machine_workflow.ts:50:5)
    at TokenMachineWorkflow.reauthenticate (D:\code\mongoose-8-8-type-error\node_modules\mongodb\src\cmap\auth\mongodb_oidc\machine_workflow.ts:72:5)
    at MongoDBOIDC.auth (D:\code\mongoose-8-8-type-error\node_modules\mongodb\src\cmap\auth\mongodb_oidc.ts:151:7)
    at MongoDBOIDC.reauth (D:\code\mongoose-8-8-type-error\node_modules\mongodb\src\cmap\auth\auth_provider.ts:72:7)
    at ConnectionPool.reauthenticate (D:\code\mongoose-8-8-type-error\node_modules\mongodb\src\cmap\connection_pool.ts:571:5)
    at Server.command (D:\code\mongoose-8-8-type-error\node_modules\mongodb\src\sdam\server.ts:348:9)
    at InsertOneOperation.executeCommand (D:\code\mongoose-8-8-type-error\node_modules\mongodb\src\operations\command.ts:179:12) {
  errorResponse: {
    ok: 0,
    errmsg: 'Authentication failed.',
    code: 18,
    codeName: 'AuthenticationFailed'
  },
  ok: 0,
  code: 18,
  codeName: 'AuthenticationFailed',
  [Symbol(errorLabels)]: Set(0) {}
}
```

### Changes done to files cloned from official setup tools from mongodb repos:

- [oidc-mock-provider.js](./docker-test-envs/docker/oidc/mock-oidc-provider/oidc-mock-provider.js)
  using my own version of the package, check last file in list (1 line change)

  - Line 1:
    ```diff
    -:  const { OIDCMockProvider } = require('@mongodb-js/oidc-mock-provider');
    +:  const { OIDCMockProvider } = require('./mongodb-js-oidc-mock-provider');
    ```
  - Line 6:
    ```diff
      expires_in: process.env.OIDC_TOKEN_PAYLOAD_EXPIRES_IN
    ? Number(process.env.OIDC_TOKEN_PAYLOAD_EXPIRES_IN)
    -:  3600,
    +:  30,
    ```

- [proxy.js](./docker-test-envs/docker/oidc/mock-oidc-provider/proxy.js)

  - Only debugging helpers for docker logs, 0 functionality:
    ```diff
    const proxy = http.request(options, function (res) {
    +  console.log(
    +        '[OIDC PROVIDER PROXY]',
    +        res.statusCode,
    +        clientReq.method,
    +        clientReq.url
    +      );
    +      res.statusCode !== 200 &&
    +        (() => {
    +          let data = '';
    +          res.on('data', (chunk) => (data += chunk));
    +          res.on('end', () => {
    +            console.log('[OIDC PROVIDER PROXY - ERROR]', data);
    +            console.log(
    +              '[OIDC PROVIDER PROXY - Content Type is]',
    +              clientReq.headers['content-type']
    +            );
    +          });
    +        })();
    ```

- [Dockerfile](./docker-test-envs/docker/oidc/mock-oidc-provider/Dockerfile)

  - Docker image arch, you might need to edit this to match your machine's architecture
    ```diff
    - ARG NODE_PACKAGE=node-v$NODE_VERSION-linux-arm64
    + ARG NODE_PACKAGE=node-v$NODE_VERSION-linux-x64
    ARG NODE_HOME=/opt/$NODE_PACKAGE
    ENV NODE_PATH $NODE_HOME/lib/node_modules
    ENV PATH $NODE_HOME/bin:$PATH
    RUN curl https://nodejs.org/dist/v$NODE_VERSION/$NODE_PACKAGE.tar.gz | tar -xzC /opt/
    RUN mkdir -p /tmp/mock-provider && cd /tmp/mock-provider && npm init -y && npm install @mongodb-js/oidc-mock-provider
    COPY start-server.sh /start-server.sh
    + COPY mongodb-js-oidc-mock-provider.js /mongodb-js-oidc-mock-provider.js
    COPY oidc-mock-provider.js /tmp/mock-provider/oidc-mock-provider.js
    ```
    I added my custom oidc provider, it has only a 1 line change specified in next file

- [mongodb-js-oidc-mock-provider.ts](./mongodb-js-oidc-mock-provider.ts)

```diff
if (
+  // ONLY CHANGE IN THIS FILE FROM THE OG published package
-  req.headers['content-type'] !== 'application/x-www-form-urlencoded'
+ !req.headers['content-type']?.includes(
+   'application/x-www-form-urlencoded'
+ )
```

## Final thoughts:

- I do not think this bug is related to mongoose specifically, this is what the mongodb support ticket (case #01422726) said
- I havent found anything in mongoose that suggests they do their own authentication flow
- But i could be wrong, i hope this gets resolved quickly
