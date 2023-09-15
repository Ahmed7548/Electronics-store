FROM node:18.12.1-alpine

WORKDIR /app 

COPY package.json ./

RUN npm install --omit=dev

COPY ./build .

USER node

CMD ["npm", "start"]

EXPOSE 5000
