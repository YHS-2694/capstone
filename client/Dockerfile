# 1. Use Node to build the app
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Install a simple web server to serve the static files
RUN npm install -g serve

# 3. Serve the 'dist' folder on port 8080
# (NOTE: If you use Create-React-App, change 'dist' to 'build' below)
CMD ["serve", "-s", "dist", "-l", "8080"]