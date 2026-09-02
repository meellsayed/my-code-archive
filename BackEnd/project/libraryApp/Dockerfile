FROM node:22.22.2 AS base
WORKDIR /app
COPY package.json .

FROM base AS dev
RUN npm i
COPY . .
CMD [ "npm" , "run" , "start:dev" ]

FROM base AS prod
RUN npm i --only=production
COPY . .
CMD [ "npm" , "run" , "start" ]

