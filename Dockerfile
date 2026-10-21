FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code with ownership assigned to node user
COPY --chown=node:node . .

# Set non-root user
USER node

# Expose app port
EXPOSE 5000

# Start application
CMD ["node", "server.js"]

