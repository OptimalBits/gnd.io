FROM	ubuntu:12.04
RUN apt-get update
RUN apt-get install -y python-software-properties python g++ make
RUN add-apt-repository ppa:chris-lea/node.js
RUN apt-get update
RUN apt-get install -y nodejs
RUN npm install -g pm2
ADD . /gnd.io
RUN cd /gnd.io; npm install
EXPOSE  8000
ENTRYPOINT ["pm2", "start", "--no-daemon", "/gnd.io/app.js"]
