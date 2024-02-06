# Use the official Node.js image as the base image
FROM node:14

# Set the working directory
WORKDIR /app/backend

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app will run on
EXPOSE 8670

# Start the backend server
CMD ["npm", "run" ,"devstart"]
