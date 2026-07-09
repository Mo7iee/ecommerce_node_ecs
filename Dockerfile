FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm install --production && npm cache clean --force
COPY src ./src
EXPOSE 3000
CMD ["node", "src/app.js"]


 