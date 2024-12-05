import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "Nakamura0601",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];

const getItems = async () => {
  let listResult = await db.query("SELECT * FROM lists ORDER BY id ASC");
  const listData = listResult.rows;
  const result = await db.query("SELECT id, title, TO_CHAR(creation_date, 'DMon') AS creation_date, list_id FROM items ORDER BY id ASC");
  const data = result.rows;

  //Allocate each item to corresponding list id group
  for (let i = 0; i < listData.length; i++) {
    listData[i].items = data.filter(item => item.list_id === listData[i].id);
    console.log(listData[i].id);
  }

  return listData;
}

app.get("/", async (req, res) => {
  try {
    const lists = await getItems();
    res.render("index.ejs", {
      lists: lists
    });
  } catch(err) {
    console.log(err);
  }

});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    await db.query("INSERT INTO items (title, creation_date) VALUES($1, NOW())", [item]);
    res.redirect("/");
  } catch(err) {
    console.log(err);
  }

});

app.post("/edit", async (req, res) => {
  const itemTitle = req.body.updatedItemTitle;
  const itemId = req.body.updatedItemId;
  try {
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [itemTitle, itemId]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
  
  
});

app.post("/delete", async (req, res) => {
  const itemId = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM items WHERE id = $1", [itemId]);
    res.redirect("/");
  } catch(err) {
    console.log(err);
  }
  
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
