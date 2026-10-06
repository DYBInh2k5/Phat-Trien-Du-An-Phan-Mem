# Dockerfile for HTQLLH Node.js Express Clean Architecture Backend
FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application source code
COPY . .

# Expose port 8081
EXPOSE 8081

# Environment variables default
ENV PORT=8081
ENV NODE_ENV=production

# Start application server
CMD ["node", "server.js"]
