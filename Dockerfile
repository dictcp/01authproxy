FROM node:8-jessie

RUN npm install -g yarn

WORKDIR /srv
ADD ./ /srv/

RUN yarn install

CMD node server.js
