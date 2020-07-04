FROM node:12.18.2

LABEL version="1.0"
LABEL description="Node 12.18.2 LTS"

# Install app dependencies
ADD package.json /tmp/package.json
RUN cd /tmp && npm install --quiet
RUN mkdir -p /app && cp -R /tmp/node_modules /app

# Copy application code.
COPY . /app/

WORKDIR /app

# Install dependencies.
RUN npm --unsafe-perm install