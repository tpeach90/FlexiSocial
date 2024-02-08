FROM node:18.17.1

WORKDIR /usr/src/file-server

COPY package*.json ./

RUN npm install

COPY . .

ENV PGHOST='database-flexisocial'
ENV PGPORT='5432'
ENV PGDATABASE='flexisocial'
ENV PGUSER='flexisocial-user'
ENV PGPASSWORD='cf2EM7FDz;Z`$5%'
ENV FLEXISOCIAL_STORE='test_store'

EXPOSE 3000

CMD ["npm", "start"]