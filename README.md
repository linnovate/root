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
