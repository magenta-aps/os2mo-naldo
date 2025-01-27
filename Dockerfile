FROM node:20-alpine AS base

WORKDIR /app

COPY web/package.json web/yarn.lock ./

RUN yarn install --frozen-lockfile && yarn cache clean

COPY web .

# Add build version to the environment last to avoid build cache misses
ARG COMMIT_TAG
ENV PUBLIC_COMMIT_TAG=${COMMIT_TAG:-HEAD}

# --- DEV ---
FROM base as dev

CMD yarn dev --host

# --- PROD ---
FROM base as prod

RUN yarn build

CMD node /app/build
