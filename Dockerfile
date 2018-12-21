FROM node:10-alpine

COPY package.json package-lock.json ./
RUN npm install

COPY . ./
RUN npm run build

CMD npm start
