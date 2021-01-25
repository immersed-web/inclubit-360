FROM node
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 6060
CMD [ "node", "server.js" ]