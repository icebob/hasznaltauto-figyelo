FROM node:alpine

ADD html.template index.js package.json package-lock.json app/

RUN apk add --no-cache npm && \
	cd app && \
	npm ci && \
    npm cache clean --force

WORKDIR /app

CMD node index.js
