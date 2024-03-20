FROM node:21-alpine

ADD . /project

RUN cd /project && npm install
WORKDIR /project/site
RUN npm run build

EXPOSE 3000

CMD npm start