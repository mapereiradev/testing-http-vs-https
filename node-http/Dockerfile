# Use the Node.js official image
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy the package.json and install dependencies
COPY ./app/package*.json ./
RUN npm install

# Copy the app source code
COPY ./app ./

# Expose the HTTP port
EXPOSE 8080

# Set environment variable to false for HTTP
ENV HTTPS=false

# Start the HTTP server
CMD [ "node", "index.js" ]

