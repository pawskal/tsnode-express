FROM node:10

WORKDIR /app

COPY package.json ./

RUN npm install

COPY ./example /app

CMD [ "./node_modules/.bin/ts-node", "-r", "dotenv/config", "./index.ts", "dotenv_config_path=./.env" ]