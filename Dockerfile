# PAVICS - Project Management API
#
# VERSION 0.11.1
FROM node:8.2.1-alpine
MAINTAINER Renaud Hébert-Legault <renaud.hebert-legault@crim.ca>
LABEL Description="PAVICS - Project Management API Based on Node.js, Loopback and SwaggerUI" Vendor="CRIM" Version="0.11.1"

ENV NODE_ENV=production
ADD package.json package.json
ADD package-lock.json package-lock.json
RUN npm install
ADD . .

CMD npm run bootstrap && npm start
EXPOSE 3005

