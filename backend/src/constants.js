import { config } from "dotenv";

config({ path: "../.env" });

export const RAW_DATA_TOPIC = "raw_data";
export const HOST = "localhost"; // Running on localhost for testing

export const POSTGRES_HOST = "localhost";
export const POSTGRES_PORT = 5432;
export const POSTGRES_USER = process.env.POSTGRES_USER;
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
export const POSTGRES_DB = process.env.POSTGRES_DB;
