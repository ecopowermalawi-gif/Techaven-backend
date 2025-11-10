FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies (use package-lock for reproducible builds)
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the app
CMD ["node", "src/index.js"]
