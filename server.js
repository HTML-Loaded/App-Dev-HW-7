import express from "express";
import pg from "pg"

const app = express();
const port = 3000;
const root = path.dirname(fileURLToPath(import.meta.url));

const db = new pg.Client({
  user: "postgres",
  password: "123456",
  host: "localhost",  
  port: 5432,
  database: "mystore",  
});

app.set("view engine", "ejs");
app.use(express.json());

db.connect();

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/api/dashboard", async (req, res) => {

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
