import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

//getting info from pg db

const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  password: '', //enter your postgres pw here
  database: 'world',
  port: 5432,
});

db.connect();

//Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//function to get the previously entered countries from the db
async function country_list() {
  const search_result = await db.query(
    "SELECT country_code FROM visited_countries;"
  );
  let visited_countries = search_result.rows;

  let countries_count = 0;
  let countries_array = [];
  visited_countries.forEach((element) => {
      countries_array.push(element.country_code);
      countries_count++;
  });
  
  return [countries_array, countries_count];
};

//home page
app.get("/", async (req, res) => {
  let countries = await country_list();

  res.render("index.ejs", {
    total: countries[1],
    countries: countries[0]
  });
});

//adding or removing a country from the list
app.post("/change", async (req,res) => {
  let entered_data = req.body.country.toLowerCase().trim();
  //checking if the entered country exist
  try {
    let first_query = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%'", [entered_data]
      );
    let selected_code = first_query.rows[0].country_code;
      // checking if user has pressed the submit or delete button 
    const submittedButton = req.body.submitButton;
    if (submittedButton === 'submit') {
      //adding the entered country to the list
      try {
        await db.query(
          "INSERT INTO visited_countries (country_code) Values($1)", [selected_code]
        );
        res.redirect('/');
      } 

      //giving same results as from the home page + duplicated country error
      catch (error) {
        console.error(error);
        let countries = await country_list();
    
        res.render("index.ejs", {
          total: countries[1],
          countries: countries[0],
          error: "The country has already been added. Try again"
        });
      };
      //removing entered country from the list
    } else {
      await db.query("DELETE FROM visited_countries WHERE country_code=$1", [selected_code]);
      res.redirect('/');
    }

  }
  //giving same results as from the home page + country does not exists error
  catch (error) {
    console.error(error);
    let countries = await country_list();

    res.render("index.ejs", {
      total: countries[1],
      countries: countries[0],
      error: "The country you've entered does not exist. Please, try again"
    });
  };

});

//delete all countries from the current list
app.get("/delete", async (req, res) => {
  await db.query("DELETE FROM visited_countries");
  res.redirect('/');
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
