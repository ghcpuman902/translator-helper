FROM node:12

# Create app directory
WORKDIR /usr/src/client

# Install app dependencies
COPY package*.json ./

RUN npm install --only=production

# Bundle app source
COPY . /usr/src/client

CMD [ "npm", "run", "start" ]