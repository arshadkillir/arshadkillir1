# Use the official Node.js 18 image as a base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json)
COPY package*.json ./

# Copy the rest of your application's code
COPY . .

# The Vite dev server will run on port 3000
EXPOSE 3000
