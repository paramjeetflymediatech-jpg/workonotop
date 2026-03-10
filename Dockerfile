# Build Cache Bust: 123456
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package management files
COPY package*.json ./

# Copy scripts first (needed for postinstall)
COPY scripts/ ./scripts/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Explicitly copy .env
COPY .env ./

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]