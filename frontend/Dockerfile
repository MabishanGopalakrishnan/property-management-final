# FROM node:20
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build
# EXPOSE 5173
# CMD ["npm", "run", "dev", "--", "--host"]


# ---------- BUILD STAGE ----------
FROM node:20 AS build

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build   # outputs to /app/dist

# ---------- NGINX STAGE ----------
FROM nginx:latest

# Nginx config (we’ll create this file next)
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend into Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
