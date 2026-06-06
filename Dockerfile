FROM oven/bun:1.2-alpine

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

COPY docker/dev-entrypoint.sh /usr/local/bin/dev-entrypoint.sh
RUN chmod +x /usr/local/bin/dev-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["dev-entrypoint.sh"]
