# 1. Use the official Node.js LTS image as the base
FROM node:lts-buster

# 2. Update the system and install ffmpeg for MP3 conversion and image tools
RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

# 3. Set the working directory inside the container
WORKDIR /root/nexa-md

# 4. Copy package.json and install dependencies
COPY package.json .
RUN npm install

# 5. Copy the rest of the project files
COPY . .

# 6. Start the bot
CMD ["npm", "start"]
