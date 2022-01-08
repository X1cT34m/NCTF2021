FROM    ubuntu:18.04
COPY    sources.list /etc/apt/sources.list
COPY    start.sh /
COPY    flag /flag
RUN        apt update \
        && apt install -y openjdk-11-jdk \
        && chmod +x /start.sh \
        && useradd wh1sper 
COPY    X1cT34m_API_System.jar /app/
USER    wh1sper
