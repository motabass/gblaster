FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV LC_ALL=C.UTF-8

RUN apt-get update
RUN apt-get install -y \
  git \
  nodejs \
  npm \
  && rm -rf /var/lib/apt/lists/*