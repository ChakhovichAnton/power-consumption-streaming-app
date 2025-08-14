import os

POWER_CONSUMPTION_DATA_INSERTION_QUERY = """
INSERT INTO power_consumption_data (
    timestamp,
    global_active_power,
    global_reactive_power,
    voltage,
    global_intensity,
    submetering1,
    submetering2,
    submetering3
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"""

HOURLY_POWER_CONSUMPTION_DATA_INSERTION_QUERY = """
INSERT INTO hourly_power_consumption_data (
    event_count,
    timestamp_start,
    timestamp_end,
    global_active_power_avg,
    global_reactive_power_avg,
    voltage_avg,
    global_intensity_avg,
    submetering1_avg,
    submetering2_avg,
    submetering3_avg
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"""

POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSWORD')
POSTGRES_USER = os.environ.get('POSTGRES_USER')
POSTGRES_DB = os.environ.get('POSTGRES_DB')
POSTGRES_DRIVER = 'org.postgresql.Driver'
POSTGRES_PORT = 5432
POSTGRES_URL = f'jdbc:postgresql://postgres:{POSTGRES_PORT}/{POSTGRES_DB}'
