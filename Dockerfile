# Use the official Ubuntu Focal (20.04 LTS) image as the base image
FROM ubuntu:focal

# Disable interactive installation
ENV DEBIAN_FRONTEND=noninteractive  

# Install required dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gif2apng \ 
    && curl -fsSL https://deb.nodesource.com/setup_current.x | bash - \
    && apt-get install -y nodejs

# Set the working directory
WORKDIR /app

# Copy files to working directory
COPY . .

# Install dependencies
RUN npm install --only=production

# Run app
CMD ["npm", "start"]