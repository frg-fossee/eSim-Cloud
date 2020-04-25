FROM node:alpine

RUN mkdir /code
WORKDIR /code

COPY package.json /code/package.json
COPY package-lock.json /code/package-lock.json

RUN npm install

