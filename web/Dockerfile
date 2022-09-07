# TODO: Setup dev and prod env
FROM node:16-alpine AS base

WORKDIR /app/web

COPY web/package.json web/yarn.lock ./

RUN yarn install --frozen-lockfile && yarn cache clean

COPY web .

# --- DEV ---
FROM base as dev

CMD yarn dev --host

# --- BUILD ---
FROM base as build

RUN yarn build

CMD yarn preview --host

# --- PROD ---
FROM nginx:1.19-alpine AS prod

COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/web/build /usr/share/nginx/html/
