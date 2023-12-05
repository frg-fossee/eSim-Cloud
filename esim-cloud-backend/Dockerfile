# Builder stage 1: NGSpice and Compiling tools
FROM python:3.7-alpine3.13 as builder

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

RUN mkdir /code
WORKDIR /code

ENV NGSPICE_VERSION 31

RUN apk add --no-cache --virtual .build-deps \
    autoconf \
    automake \
    bison \
    curl \
    flex \
    g++ \
    libx11-dev \
    libxaw-dev \
    libtool \
    make

RUN curl -fSL https://github.com/imr/ngspice/archive/ngspice-$NGSPICE_VERSION.tar.gz -o ngspice.tar.gz \
    && mkdir -p /usr/src \
    && tar -zxC /usr/src -f ngspice.tar.gz \
    && rm ngspice.tar.gz \
    && cd /usr/src/ngspice-ngspice-$NGSPICE_VERSION \
    && ./autogen.sh \
    && ./configure \
    && make \
    && make install \
    && apk del .build-deps

# Builder stage 2: Arduino CLI and Compiling tools
FROM python:3.7-alpine3.13 as arduino_builder

ENV USER=root

RUN apk add \
        wget \
        tar \
        ca-certificates \
        gcc-avr \
        binutils \
        avr-libc \
        ctags

ENV USER=root

RUN wget -O /tmp/cli.tar.gz \
        https://downloads.arduino.cc/arduino-cli/arduino-cli_0.10.0_Linux_64bit.tar.gz && \
    cd /tmp && \
    mkdir arduino && \
    tar -xvf /tmp/cli.tar.gz && \
    mv /tmp/arduino-cli /usr/bin/arduino-cli && \
    rm /tmp/cli.tar.gz

RUN arduino-cli core update-index \
	&& arduino-cli core install arduino:avr \
    && arduino-cli lib install Servo \
    && arduino-cli lib install Stepper \
    && arduino-cli lib install LiquidCrystal \
    && cd /root/.arduino15/ \
    && find / -name platform.txt -exec sed -i "s/^compiler.path=.*$/compiler.path=/g" {} \; \
    && find . -name ctags -exec ln -nsf /usr/bin/ctags {} \;


# Final stage
FROM python:3.7-alpine3.13

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

RUN apk add --no-cache libxt jpeg-dev zlib-dev libxaw-dev libx11-dev libtool mariadb-connector-c-dev libffi-dev postgresql-dev

COPY --from=builder /usr/local /usr/local
COPY --from=arduino_builder /usr/bin/arduino-cli /usr/bin/arduino-cli

WORKDIR /code

COPY requirements.txt /code/
RUN apk add --no-cache mariadb-connector-c-dev ;\
    apk add --update alpine-sdk && \
    apk add libffi-dev openssl-dev && \
    apk --no-cache --update add build-base ;\
    apk add --no-cache --virtual .build-deps gcc python3-dev musl-dev mariadb-dev\
    && pip install --upgrade pip\
    && pip install --trusted-host pypi.python.org -r requirements.txt \
    && apk del .build-deps
