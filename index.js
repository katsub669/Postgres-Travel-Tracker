import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

//getting info from pg db

const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  password: 'H72PiSwS!', //enter your postgres pw here
  database: 'world',
  port: 5432,
});

db.connect();

//Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function user_list() {
  const search_result = await db.query(
    "SELECT * FROM users"
  );
  let user_list = search_result.rows;
  return user_list
}

let tempList = await user_list();
let currentUserId = tempList[0].id;

async function current_user() {
  const search_result = await db.query(
    "SELECT * FROM users WHERE users.id = $1", [currentUserId]
  );
  let user_list = search_result.rows;
  return user_list[0];
}

//function to get the previously entered countries from the db
async function country_list() {
  const search_result = await db.query(
    "SELECT country_code FROM visited_countries AS v JOIN users AS u ON u.id = v.user_id WHERE u.id=$1",
    [currentUserId]
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
  let currentUser = await current_user();
  let countries = await country_list();
  let users = await user_list();

  if (currentUserId) {
  res.render("index.ejs", {
    total: countries[1],
    countries: countries[0],
    users: users,
    color: currentUser.color,
  });
  } else {
    res.render('new.ejs');
  }
});

//adding or removing a country from the list
app.post("/change", async (req,res) => {
  let entered_data = req.body.country.toLowerCase().trim();
  let currentUser = await current_user();
  let users = await user_list();

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
          "INSERT INTO visited_countries (country_code, user_id) Values($1, $2)", [selected_code, currentUserId]    //CHANGE THIS TO ADD USER_id
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
          users: users,
          color: currentUser.color,
          error: "The country has already been added. Try again"
        });
      };
      //removing entered country from the list
    } else {
      await db.query("DELETE FROM visited_countries WHERE country_code=$1 AND user_id=$2", [selected_code, currentUserId]);
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
      users:users,
      color: currentUser.color,
      error: "The country you've entered does not exist. Please, try again"
    });
  };

});

//delete all countries from the current list
app.get("/delete", async (req, res) => {
  await db.query("DELETE FROM visited_countries WHERE user_id=$1", [currentUserId]);
  res.redirect('/');
});

app.post("/user", async (req, res) => {
  if (req.body.add !== 'new') {
    currentUserId = req.body.user;
    res.redirect('/');
  }
  else {
    res.render('new.ejs')
  }
});

app.post("/new", async (req, res) => {
  let newName = req.body.name;
  let newColor = req.body.color;
  await db.query(
    "INSERT INTO users (name, color) VALUES ($1, $2)", [newName, newColor]
  );
  tempList = await user_list();
  currentUserId = tempList[0].id;
  res.redirect('/');
});


app.post("/deleteUser", async (req, res) => {
  tempList = await user_list();

  let deleteValue = req.body.deleteUser;
  await db.query(
    "DELETE FROM visited_countries WHERE user_id = $1", [deleteValue]
  );
  await db.query(
    "DELETE FROM users WHERE id = $1", [deleteValue]
  );
  if (tempList.length === 1) {  
    res.render("new.ejs")
  } else {
  tempList = await user_list();
  currentUserId = tempList[0].id;
  res.redirect('/');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
