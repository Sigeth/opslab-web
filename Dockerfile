# The built UI in /dist. The Helm chart copies it into the api pod with an
# init container (cp), and the api serves it (OPSLAB_WEB_DIR).
FROM docker.io/library/node:24 AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM docker.io/library/busybox:1.38.0
COPY --from=build /src/dist /dist
USER 65532:65532
