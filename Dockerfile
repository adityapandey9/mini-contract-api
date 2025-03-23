# Use Bun base image
FROM oven/bun:1.0

# Set working directory
WORKDIR /app

# Copy only dependency manifests first (for cache)
COPY bun.lockb package.json ./

# Install dependencies
RUN bun install

# Now copy the rest of the app
COPY . .

# Expose the app port
EXPOSE 3000

# Run the app
CMD ["bun", "index.js"]
