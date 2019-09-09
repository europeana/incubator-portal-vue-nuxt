# Docker image for node app with AWS & CF CLIs
#
# This does *not* run the Europeana Portal app, but it used as the agent in its
# Jenkins Pipeline.
#
# TODO: move image to europeana/dockerfiles and publish to Docker Hub?

FROM node:12

WORKDIR /app

# Install AWS & CF CLIs
RUN apt-get -q update && apt-get -yq install apt-transport-https \
  && wget -q -O - https://packages.cloudfoundry.org/debian/cli.cloudfoundry.org.key | apt-key add - \
  && echo "deb https://packages.cloudfoundry.org/debian stable main" | tee /etc/apt/sources.list.d/cloudfoundry-cli.list \
  && apt-get -q update && apt-get -yq install python-pip cf-cli \
  && rm -rf /var/lib/apt/lists/* \
  && pip install awscli \
  && su node -c "cf install-plugin blue-green-deploy -f -r CF-Community"
