# Built UI only: the api image copies /dist and serves it (OPSLAB_WEB_DIR).
FROM docker.io/library/node:24 AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM scratch
COPY --from=build /src/dist /dist
