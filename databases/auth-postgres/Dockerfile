FROM postgres:alpine
ENV POSTGRES_PASSWORD docker
ENV POSTGRES_DB auth
# auth-tables is a directory in the current directory
COPY 01_auth_tables.sql /docker-entrypoint-initdb.d
# filling all auth-tables with data
COPY 02_auth_seed.sql /docker-entrypoint-initdb.d
