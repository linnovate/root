# Root

## Install

#### Setup

Development
```bash
npm i
npm run build
docker-compose up -d
```

#### Test
```bash
npm test [url]
```
If `url` is not specified, then a local instance will be started.


#### Deploy

```bash
docker-compose -f docker-compose.production.yml up -d
```


#### Environments
Name                 | Type    | Description            | Default
---                  | ---     | ---                    | ---
PORT                 | Number  | Port of the server     | `3000`
HTTPS                | Boolean | Use HTTPS              | `false`
HTTPS_KEY_PATH       | String  | Path to key file       | `undefined`
HTTPS_CERT_PATH      | String  | Path to cert file      | `undefined`
LANG                 | String  | `en`\|`he`             | `en`
AUTH_PROVIDER        | String  | `local` \| `google`    | `local`
GOOGLE_CLIENT_ID     | String  | Google client ID       | `APP_ID`
GOOGLE_CLIENT_SECRET | String  | Google client secret   | `APP_SECRET`
MONGODB_URI          | String  | URI of MongoDB         | `mongodb://localhost/icu-dev`
