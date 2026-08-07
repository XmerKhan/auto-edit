FROM node:22-bookworm-slim

# Install Chrome dependencies (per Remotion's Docker guide)
RUN apt-get update && apt install -y \
  libnss3 \
  libdbus-1-3 \
  libatk1.0-0 \
  libgbm-dev \
  libasound2 \
  libxrandr2 \
  libxkbcommon-dev \
  libxfixes3 \
  libxcomposite1 \
  libxdamage1 \
  libatk-bridge2.0-0 \
  libpango-1.0-0 \
  libcairo2 \
  libcups2 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install
 
# Install Chrome for Remotion
RUN npx remotion browser ensure
 
# Copy source code
COPY . ./

# Build TypeScript
RUN npm run build

# Create directories for uploads and output
RUN mkdir -p uploads output

EXPOSE 3001

CMD ["node", "dist/index.js"]
