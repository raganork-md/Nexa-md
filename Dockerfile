FROM node:lts-buster

# Clear any existing lists and use a cleaner install command
RUN apt-get clean && \
    apt-get update --fix-missing && \
    apt-get install -y --no-install-recommends \
    ffmpeg \
    imagemagick \
    webp \
    ca-certificates && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /root/nexa-md

COPY package.json .
RUN npm install

COPY . .

CMD ["npm", "start"]
