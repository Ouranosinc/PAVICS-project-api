# PAVICS - Project Management API
#
# VERSION 0.0.1
FROM node:8.2-slim
MAINTAINER Renaud Hébert-Legault <renaud.hebert-legault@crim.ca>
LABEL Description="PAVICS - Project Management API Based on Node.js, Loopback and SwaggerUI" Vendor="CRIM" Version="0.0.1"

ENV NODE_ENV=production
ADD package.json package.json
RUN npm install
ADD . .

CMD ["npm","start"]
EXPOSE 3005

