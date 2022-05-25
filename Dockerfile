FROM node:alpine

ADD . app
RUN apk add --no-cache npm && \
	cd app && \
	npm install

WORKDIR /app

CMD node index.js
