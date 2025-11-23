# Use the official Node.js 18 image as a base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json)
COPY package*.json ./

# Copy Prisma schema before installing dependencies to ensure Prisma Client is generated correctly
COPY prisma ./prisma/

# Install dependencies
RUN apt-get update && apt-get install -y curl && npm install

# Copy the rest of your application's code
COPY . .

# The backend server will run on port 4000
EXPOSE 4000
