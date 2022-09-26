FROM node:15-slim

RUN apt-get update &&\ 
    apt-get install -y wget gnupg &&\
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - &&\
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' &&\
    apt-get update &&\ 
    apt-get install redis-server sudo google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 -y --no-install-recommends &&\
    rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true 

WORKDIR /home/node

COPY web .

RUN yarn add puppeteer

COPY start.sh /

RUN chmod +x /start.sh


ENTRYPOINT [ "/start.sh" ]
