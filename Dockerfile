FROM node:4

USER node

RUN mkdir /home/node/app

WORKDIR /home/node/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]

