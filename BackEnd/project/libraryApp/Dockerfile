FROM node:22.22.2

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD [ "npm", "run","start:dev" ]
