FROM node:19-alpine3.16 as build
WORKDIR /app
COPY package.json .
RUN npm install --prefer-offline --no-audit --progress=false
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]