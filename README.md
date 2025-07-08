# Power Consumption Streaming App

## Introduction

Dataset: [Individual Household Electric Power Consumption](https://archive.ics.uci.edu/dataset/235/individual+household+electric+power+consumption)

## Technology Stack

## Running the Project

Download the dataset from [here](https://archive.ics.uci.edu/dataset/235/individual+household+electric+power+consumption) and paste it into the `data` directory. The name of the data file must be `household_power_consumption.txt`.

Install dependencies in the `code/backend` directory with:
```bash
npm install
```

Run Kafka in the `code` directory with:
```bash
docker-compose up
```

The Kafka provision script can be run in the `code/backend` directory with:
```bash
npm run provision-kafka
```

To test the system, one must producer messages. The producer can be started in the `code/backend` directory with:
```bash
npm run data-producer
```
