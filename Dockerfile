FROM oven/bun:latest

WORKDIR /usr/src/app

COPY package.json bun.lockb ./
RUN mkdir server
COPY server/package.json server/bun.lockb ./server/
RUN bun install

COPY ./ ./
RUN bun build

CMD ["bun", "start"]
EXPOSE 8000