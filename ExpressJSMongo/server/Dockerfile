# Use Node 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all other source code
COPY . .

# Expose the port your app uses
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]