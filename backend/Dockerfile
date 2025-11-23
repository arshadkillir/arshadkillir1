FROM node:20-alpine

WORKDIR /app

# Install OpenSSL, required by Prisma on Alpine
RUN apk add openssl

# Expose backend API port
EXPOSE 4000

# The command to run the server will be provided by docker-compose.yml
# We will install dependencies via the command in docker-compose.yml
# to take advantage of the mounted volume for development.
