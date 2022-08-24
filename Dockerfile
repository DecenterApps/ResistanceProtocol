# syntax=docker/dockerfile:1

FROM python:3.8.10

WORKDIR /opt/app

COPY simulations simulations/ 

WORKDIR /opt/app/simulations

RUN pip install -r requirements.txt