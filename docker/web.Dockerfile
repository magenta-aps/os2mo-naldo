FROM node:16-alpine AS base

WORKDIR /app

COPY web/package.json web/yarn.lock ./

RUN yarn install --frozen-lockfile && yarn cache clean

COPY web .

# --- DEV ---
FROM base as dev

CMD yarn dev --host

# --- PROD ---
FROM base as prod

RUN yarn build

CMD node /app/build
