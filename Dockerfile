FROM node:18.6.0-bullseye

# Start installing the dependencies from our app
WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "."]

RUN npm install

EXPOSE 3000

# Finally run the application
CMD ["npm", "start"]
