# Power Consumption Streaming App

## Introduction

The application contains a data pipeline, which does the following:

- The backend reads raw data from a text file, and published it into a Kafka topic
- A Flink app reads data, filters datapoints with null values, publishes the data into a Kafka topic, and saves the data into a PostgreSQL database. Furthermore, it aggregated the data into 1 hour long windows with the averages of the datapoints within a window. The new aggregated data is saved into the PostgreSQL database
- The backend power consumption API provides REST endpoints for accessing the data stored in PostgreSQL. Additionally, it consumes a Kafka topic to provide real-time data from a Socket.io endpoint. Both endpoints are used by the frontend
- The frontend is used for visualizing the datapoints and viewing the past eletricity consumption

The dataset ([Individual Household Electric Power Consumption](https://archive.ics.uci.edu/dataset/235/individual+household+electric+power+consumption)) consists of the following attributes:

1. `date` in format `dd/mm/yyyy`
2. `time` in format `hh:mm:ss`
3. `global_active_power` household global minute-averaged active power (in kilowatt)
4. `global_reactive_power` household global minute-averaged reactive power (in kilowatt)
5. `voltage`: minute-averaged voltage (in volt)
6. `global_intensity`: household global minute-averaged current intensity (in ampere)
7. `sub_metering_1`: energy sub-metering No. 1 (in watt-hour of active energy) corresponding to a kitchen
8. `sub_metering_2`: energy sub-metering No. 2 (in watt-hour of active energy) corresponding to a laundry room
9. `sub_metering_3`: energy sub-metering No. 3 (in watt-hour of active energy) corresponding to an electric water-heater and an air-conditioner

## Technology Stack

The stream app consists of the following components:

- Node.js backend with Express and Socket.io
- PyFlink app
- PostgreSQL database
- Kafka
- React Vite frontend with TypeScript, Socket.io and TailwindCSS

## Running the Project

The `.env` file contains example environmental variables for running the project locally. The application has been tested with the following versions:

- Node.js: `v22.16.0`
- npm: `v11.4.1`
- Docker: `v28.1.1`
- Docker Compose: `v2.35.1`

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

Start the power consumption API in the `backend` directory with:
```bash
npm run power-consumption-api
```

Start the frontend in the `frontend` directory with:
```bash
npm run dev
```

To test the system, one must producer messages. The producer can be started in the `backend` directory with:
```bash
npm run data-producer
```
