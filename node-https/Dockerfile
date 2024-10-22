# Use the Node.js official image
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy the package.json and install dependencies
COPY ./app/package*.json ./
RUN npm install

# Copy the app source code
COPY ./app .

# Copy SSL certificates to the container
RUN mkdir -p /usr/src/app/ssl
COPY ssl/server.key ssl/server.crt /usr/src/app/ssl/

# Expose the HTTPS port
EXPOSE 8443

# Set environment variable to true for HTTPS
ENV HTTPS=true

# Set the port to 8443 (or any other value)
ENV PORT=8443

# Start the HTTPS server
CMD [ "node", "index.js" ]

