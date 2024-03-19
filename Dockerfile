FROM node:18

WORKDIR ./migration

# Copy project
COPY ./src /migration/src
COPY ./migrations /migration/migrations
COPY ./bin /migration/bin

COPY ./run_migration.sh /migration/run_migration.sh
COPY ./package.json /migration/package.json

#Install dependencies
RUN npm install

#Install mongotools for mongodump
RUN apt-get install gnupg curl
RUN curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
RUN echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
RUN apt-get update
RUN apt-get install -y mongodb-org-tools=6.0.14

# Create vbmigration
RUN npm install -g .

#Make migration script executable
RUN chmod +x /migration/run_migration.sh

#Execute migration on startup
ENTRYPOINT "/migration/run_migration.sh"