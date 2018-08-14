FROM node:alpine

RUN apk add --no-cache git npm &&\
	git clone https://github.com/ecklm/hasznaltauto-figyelo.git app &&\
	cd app &&\
	npm install

WORKDIR /app

CMD node index.js
