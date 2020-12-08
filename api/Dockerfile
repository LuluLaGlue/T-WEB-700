FROM node:8.7.0-alpine

RUN mkdir -p /srv/app/api
WORKDIR /srv/app/api

COPY package.json /srv/app/api
COPY package-lock.json /srv/app/api
RUN npm install
COPY . /srv/app/api
CMD ["npm", "run", "dev"]