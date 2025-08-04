import os

POWER_CONSUMPTION_DATA_INSERTION_QUERY = """
INSERT INTO power_consumption_data (
    timestamp,
    globalActivePower,
    globalReactivePower,
    voltage,
    globalIntensity,
    subMetering1,
    subMetering2,
    subMetering3
) values (?, ?, ?, ?, ?, ?, ?, ?)"""

POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD")
POSTGRES_USER = os.environ.get("POSTGRES_USER")
POSTGRES_DB = os.environ.get("POSTGRES_DB")
POSTGRES_DRIVER = 'org.postgresql.Driver'
POSTGRES_PORT = 5432
POSTGRES_URL = f'jdbc:postgresql://postgres:{POSTGRES_PORT}/{POSTGRES_DB}'
