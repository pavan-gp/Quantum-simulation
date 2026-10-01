# Stage 1: Build React static assets
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files
COPY package.json ./

# Install npm packages
RUN npm install

# Copy source assets
COPY . .

# Compile application build
RUN npm run build

# Stage 2: Serve built pages using Nginx server
FROM nginx:alpine

# Copy compiled assets from Stage 1 builder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
