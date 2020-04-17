#--------------------------
# Web Assignment Dockerfile
# -------------------------
# To build, run `docker build -t webassign .`
# To run, run `docker run -p 3000:3000 -d --name wa_container webassign`
# To stop the container, run `docker stop wa_container`
#
# To access the web server, connect to http://localhost:3000/ 
#   Note: If using Docker Toolbox, open up a docker quickstart
#   terminal and look for the IP address located in the intro message and
#   then connect to http://THAT_IP:3000/
#
# To access the files that you need to change, first see which volume is in use
#   docker container inspect -f '{{range .Mounts}}{{.Source}}{{end}}' wa_container
# Go to that path and you should see a project directory. In that folder is a
# file labelled 'queries.js'. Edit that file for this assignment.
#
# Note: This Dockerfile automatically creates a local volume
#   to contain the database such that it will survive container
#   restarts.

# -------------------------------------------------------------
# Multi stage build: Install mongo
# -------------------------------------------------------------
FROM debian:latest AS BUILD

# Install mongodb
# From: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian/
RUN apt update && apt install -y wget gnupg software-properties-common && \
	wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | apt-key add - && \
	echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/4.2 main" | tee /etc/apt/sources.list.d/mongodb-org-4.2.list && \
	apt update && apt install -y mongodb-org

# Install nodejs and git
RUN wget -qO - https://deb.nodesource.com/setup_13.x | bash - && \
	apt update && apt install -y nodejs git

# Download the company DB
RUN mkdir -p /data/db && \
	wget -O /data/db/companies.json http://cs457.cs.ua.edu/2017F/companies.json && \
	mongod --dbpath /data/db --fork --logpath /data/db/mongod.log && \
	mongoimport --db db --type json --file /data/db/companies.json --collection HW6

# Set up a script to start mongod at start
RUN echo "#!/bin/bash"                       >  /data/db/start_mongo.sh && \
	echo "if [[ ! -f /.active ]]; then"      >> /data/db/start_mongo.sh && \
	echo "    mongod --dbpath /data/db --fork --logpath /data/db/mongod.log" >> /data/db/start_mongo.sh && \
	echo "    touch /.active"                >> /data/db/start_mongo.sh && \
	echo "fi"                                >> /data/db/start_mongo.sh && \
	echo "cd /data/db/project"               >> /data/db/start_mongo.sh && \
	echo "node server.js"                    >> /data/db/start_mongo.sh && \
	chmod +x /data/db/start_mongo.sh

# Load the node project
# TODO: Replace with pull from gist
# RUN git clone https://github.com/nolicanoli/gist/webassign
RUN git clone https://github.com/nicholascioli/webassignment /data/db/project
WORKDIR /data/db/project
RUN npm install

# -------------------------------------------------------------
# Multi stage build: Set up web
# -------------------------------------------------------------
FROM debian:latest

COPY --from=BUILD /usr/bin/mongod /usr/bin/mongod
COPY --from=BUILD /usr/bin/mongo  /usr/bin/mongo
COPY --from=BUILD /usr/bin/node /usr/bin/node

COPY --from=BUILD /data/db /data/db

RUN apt update && apt install -y libcrypto++6 libcurl4 && useradd -M mongodb


EXPOSE 3000
VOLUME ["/data/db"]
WORKDIR /data/db/project
ENTRYPOINT ["/bin/bash", "-c", "/data/db/start_mongo.sh"]
