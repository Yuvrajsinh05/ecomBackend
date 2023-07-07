FROM node:16.15.0

RUN npm install -g nodemon

WORKDIR /Backend

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8670

CMD ["npm" , "run" , "devstart"]