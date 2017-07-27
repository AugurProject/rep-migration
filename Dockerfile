FROM node:8

WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install

COPY truffle.js /app/truffle.js
COPY contracts/ /app/contracts/
RUN npx truffle compile

COPY . /app

ENTRYPOINT [ "npm", "test" ]
