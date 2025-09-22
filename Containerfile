FROM alpine:latest

RUN apk add --no-cache nodejs npm
RUN adduser -Dh /app app
USER app
WORKDIR app

COPY --chown=app:app . /app
RUN ls -la
RUN npm install

ENTRYPOINT ["/usr/bin/node", "main.js"]
