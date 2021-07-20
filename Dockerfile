# Multi-stage image to build and run europeana/portal.js

# 0. Prevent re-installing npm packages on non-dependency changes to package.json
FROM alpine:3

WORKDIR /app

RUN apk add --no-cache jq

COPY package.json package-original.json
RUN jq -Mr '{dependencies,devDependencies}' package-original.json > package.json

COPY package-lock.json package-lock-original.json
RUN jq -Mr '{dependencies,lockfileVersion,requires}' package-lock-original.json > package-lock.json


# 1. Build
FROM node:14-alpine

ENV CHROMEDRIVER_SKIP_DOWNLOAD=true \
    GECKODRIVER_SKIP_DOWNLOAD=true \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# TODO: git is only needed to install NPM packages direct from GitHub. Remove
#       when no longer needed.
RUN apk add --no-cache git

COPY bin ./bin
COPY --from=0 /app/package.json /app/package-lock.json ./

RUN npm install

COPY babel.config.js .env.example nuxt.config.js package.json package-lock.json *.md ./
COPY src ./src

RUN npm run build

RUN npm prune --production


# 2. Run
FROM node:14-alpine

ENV PORT=8080 \
    HOST=0.0.0.0 \
    NODE_ENV=production

EXPOSE ${PORT}

WORKDIR /app

COPY --from=1 /app .

CMD ["npm", "run", "start"]
