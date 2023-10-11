FROM node:18.17.1

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN mkdir server
COPY server/package.json server/yarn.lock ./server/
RUN yarn install

COPY ./ ./
RUN yarn build

CMD ["yarn", "start"]
EXPOSE 8000