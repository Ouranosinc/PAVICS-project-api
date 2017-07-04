# PAVICS - Project Management API
#
# VERSION 0.0.1
FROM nodesource/node:6.7
MAINTAINER Renaud Hébert-Legault <renaud.hebert-legault@crim.ca>
LABEL Description="PAVICS - Project Management API Based on Node.js, Loopback and SwaggerUI" Vendor="CRIM" Version="0.0.1"

ENV NODE_ENV=production
ADD package.json package.json
RUN npm install
ADD . .

CMD ["npm","start"]
EXPOSE 3005

