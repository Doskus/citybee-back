const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

const mysqlConfig = {
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  host: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DB,
  port: process.env.MYSQL_PORT,
};

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send({ messege: "Server is running" });
});


app.get("/models", async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`SELECT * FROM models`);

    con.end();

    return res.send(data);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Unexpected error has ocurred." });
  }
});

app.post("/models", async (req, res) => {
  if (!req.body.name || !req.body.hour_price) {
    return res.status(400).send({ error: "Incorrect data has been passed" });
  }

  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [result] = await con.execute(
      `INSERT INTO models (name, hour_price) VALUES (${mysql.escape(
        req.body.name
      )}, ${mysql.escape(req.body.hour_price)})`
    );

    con.end();

    if (!result.insertId) {
      return res
        .status(500)
        .send({ error: "Execution failed." });
    }

    return res.send({ id: result.insertId });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Unexpected error has ocurred." });
  }
});


app.get("/modelscount", async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
    SELECT name, 
    COUNT(vehicles.model_id) AS count, 
    hour_price
    FROM models
    INNER JOIN vehicles ON vehicles.model_id = models.id
    GROUP BY models.id
    `);

    con.end();

    return res.send(data);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Unexpected error has ocurred." });
  }
});


app.get("/vehicles", async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
      SELECT models.name, 
      (models.hour_price + models.hour_price * 0.21) AS hour_price_pvm, 
      number_plate, 
      country_location
      FROM vehicles
      INNER JOIN models ON (models.id = vehicles.model_id)
      `);

    con.end();

    return res.send(data);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Unexpected error has ocurred." });
  }
});

app.post("/vehicles", async (req, res) => {
  if (
    !req.body.model_id ||
    !req.body.number_plate ||
    !req.body.country_location
  ) {
    return res.status(400).send({ error: "Incorrect data has been passed" });
  }

  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [result] = await con.execute(
      `INSERT INTO vehicles (model_id, number_plate, country_location) VALUES 
      (${mysql.escape(req.body.model_id)}, 
      ${mysql.escape(req.body.number_plate)}, 
      ${mysql.escape(req.body.country_location)})`
    );

    con.end();

    if (!result.insertId) {
      return res
        .status(500)
        .send({ error: "Execution failed." });
    }

    return res.send({ id: result.insertId });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Unexpected error has ocurred." });
  }
});


app.get("/vehicles/lt", async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
        SELECT models.name, 
        (models.hour_price + models.hour_price * 0.21) AS price_pvm, 
        number_plate, country_location
        FROM vehicles
        INNER JOIN models ON (models.id = vehicles.model_id)
        WHERE country_location = 'LT'
        `);

    con.end();

    return res.send(data);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Unexpected error has ocurred." });
  }
});

app.get("/vehicles/lv", async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
          SELECT models.name, 
          (models.hour_price + models.hour_price * 0.21) AS price_pvm, 
          number_plate, country_location
          FROM vehicles
          INNER JOIN models ON (models.id = vehicles.model_id)
          WHERE country_location = 'LV'
          `);

    con.end();

    return res.send(data);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Unexpected error has ocurred. " });
  }
});

app.get("/vehicles/ee", async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
            SELECT models.name, 
            (models.hour_price + models.hour_price * 0.21) AS price_pvm, 
            number_plate, country_location
            FROM vehicles
            INNER JOIN models ON (models.id = vehicles.model_id)
            WHERE country_location = 'EE'
            `);

    con.end();

    return res.send(data);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Unexpected error has ocurred." });
  }
});

app.all("*", (req, res) => {
  res.status(404).send({ error: "Page not found" });
});

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Listening on ${port}`));