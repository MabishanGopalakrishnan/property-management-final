# BUILD STAGE
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV VITE_API_URL="http://localhost:5000/api"
ENV VITE_GOOGLE_CLIENT_ID="595357260328-bgtuhfcdt7is5asi5fkikg8cndhmflbo.apps.googleusercontent.com"

RUN npm run build

# NGINX STAGE
FROM nginx:latest

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
