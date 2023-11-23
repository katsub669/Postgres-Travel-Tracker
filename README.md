# Postgres-Travel-Tracker

Requirements: Postgres/pgAdmin = 3 tables

1. Clone the files
2. Download and create acc for pgAdmin
3. in pgAdmin crete new db called 'world'
4. for the world db create table users > code:
   
   CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      color Text
   );
   
6. Add at least 1 row to the users table. Supported colors are "red, green, yellow, olive, orange, teal, blue, violet, purple, pink"   
7. for the world db create table 'visited_countries' > code:
   
   CREATE TABLE visited_countries (
     id SERIAL PRIMARY KEY,
     country_code CHAR(2) NOT NULL UNIQUE,
     user_id INTEGER REFERENCES users(id)
     );
   
9. create second table in world database called 'countries' > code:
    
   CREATE TABLE countries (
     id SERIAL PRIMARY KEY,
     country_code CHAR(2),
     country_name VARCHAR(100)
     );
   
11. Import data from the attached 'countries.csv' file to the countries table
12. npm i
13. in index.js file change the line 13 (password: '', //enter your postgres pw here) and type in your postgres pw
14. nodemon index.js
15. server is running on port 3000
  
   
