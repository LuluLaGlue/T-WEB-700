FROM node:8.7.0-alpine
RUN mkdir -p /app/directory/path
WORKDIR /app/directory/path
COPY package.json /app/directory/path
COPY package-lock.json /app/directory/path
RUN npm install
COPY . /app/directory/path
CMD ["npm", "start"]