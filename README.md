# Power Consumption Streaming App

## Introduction

Dataset: [Individual Household Electric Power Consumption](https://archive.ics.uci.edu/dataset/235/individual+household+electric+power+consumption)

## Technology Stack

## Running the Project

The `.env` file contains example environmental variables for running the project locally.

Download the dataset from [here](https://archive.ics.uci.edu/dataset/235/individual+household+electric+power+consumption) and paste it into the `data` directory. The name of the data file must be `household_power_consumption.txt`.

Install dependencies in the `backend` directory with:
```bash
npm install
```

Build the PyFlink image in the `flink-stream-app` directory with:
```bash
docker build -t pyflink:latest .
```

Start the Kafka, PostgreSQL and PyFlink containers in the root directory with:
```bash
docker-compose up
```

Give Flink write permissions for checkpointing (assuming that `9999` is the Flink user):
```bash
docker exec -it taskmanager chown -R 9999:9999 /flink-checkpoints
```

The Kafka provision script can be run in the `backend` directory with:
```bash
npm run provision-kafka
```

The PostgreSQL provision script can be run in the `backend` directory with:
```bash
npm run provision-postgres
```

Run the flink-stream-app with:
```bash
docker exec -it jobmanager flink run -py /flink-stream-app/app.py --pyFiles /flink-stream-app
```

To test the system, one must producer messages. The producer can be started in the `backend` directory with:
```bash
npm run data-producer
```
