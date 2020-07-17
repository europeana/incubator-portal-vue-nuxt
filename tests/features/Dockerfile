FROM node:12-buster

RUN apt-get update && \
    apt-get install -yq chromium chromium-driver && \
    rm -rf /var/lib/apt/lists/*

ENV NIGHTWATCH_E2E_TEST_ORIGIN=
ENV CUCUMBER_PROFILE=all

# ENV CHROMEDRIVER_SKIP_DOWNLOAD=true
ENV CHROMEDRIVER_FILEPATH=/usr/bin/chromedriver
ENV DETECT_CHROMEDRIVER_VERSION=83.0.4103.116
ENV CHROMEDRIVER_VERSION=83.0.4103.116
ENV GECKODRIVER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . ./

ENTRYPOINT ["npm", "run", "start", "--", "-p", "${CUCUMBER_PROFILE}"]
