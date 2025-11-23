# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:1.25-alpine

# Copy the built static files from the builder stage to the Nginx public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for the Nginx server
EXPOSE 80