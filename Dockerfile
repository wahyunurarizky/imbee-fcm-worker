FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY jest.config.js ./
COPY src ./src
COPY test ./test

RUN npm run build

CMD ["npm", "run", "start"]
