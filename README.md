# Postgres-Travel-Tracker

Requirements: Postgres/pgAdmin

1. Clone the files
2. Download and create acc for pgAdmin
3. in pgAdmin crete new db called 'world'
4. for the world db create table 'visited_countries' > code:
   CREATE TABLE visited_countries (
     id SERIAL PRIMARY KEY,
     country_code CHAR(2) NOT NULL UNIQUE
     );
5. create second table in world database called 'countries' > code:
   CREATE TABLE countries (
     id SERIAL PRIMARY KEY,
     country_code CHAR(2),
     country_name VARCHAR(100)
     );
6. Import data from the attached 'countries.csv' file to the countries table
7. npm i
8. in index.js file change the line 13 (password: '', //enter your postgres pw here) and type in your postgres pw
9. nodemon index.js
10. server is running on port 3000
  
   
