FROM python:3.7-alpine

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

RUN apk add --no-cache libxt jpeg-dev zlib-dev libxaw-dev libx11-dev libtool mariadb-connector-c-dev libffi-dev postgresql-dev

COPY requirements.txt /code/
RUN apk add --no-cache --virtual .build-deps gcc python3-dev musl-dev mariadb-dev musl-dev\
    && pip install --upgrade pip\
    && pip install --trusted-host pypi.python.org -r requirements.txt \
    && apk del .build-deps
