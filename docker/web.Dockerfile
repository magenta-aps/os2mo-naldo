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

# FIXME: Hack to solve this https://github.com/sveltejs/kit/issues/3726
RUN mkdir /app/build/client/new
RUN mv /app/build/client/_app /app/build/client/new

CMD node /app/build
