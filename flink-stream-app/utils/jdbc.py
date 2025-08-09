from pyflink.datastream.connectors.jdbc import JdbcConnectionOptions

from . import postgres

jdbc_connection_options = (
    JdbcConnectionOptions.JdbcConnectionOptionsBuilder()
        .with_url(postgres.POSTGRES_URL)
        .with_driver_name(postgres.POSTGRES_DRIVER)
        .with_user_name(postgres.POSTGRES_USER)
        .with_password(postgres.POSTGRES_PASSWORD)
        .build()
)
