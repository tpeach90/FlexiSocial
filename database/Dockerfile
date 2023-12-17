FROM postgis/postgis:14-3.4

ENV POSTGRES_USER="flexisocial-user"
ENV POSTGRES_PASSWORD='cf2EM7FDz;Z`$5%'
ENV POSTGRES_DB='flexisocial'

COPY ./scripts/*.sql /docker-entrypoint-initdb.d/

EXPOSE 5432