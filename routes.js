const users = require('./controllers/pokemons');
const pg = require('pg');

const configs = {
  host: 'localhost',
  port: 5432,
  user: 'cj',
  password: '',
  database: 'pokemons'
}
const client = new pg.Client(configs);
client.connect((err) => {
  if (err) console.error('connection error:', err.stack);
});

// testing async function

module.exports = (app) => {

  app.get('/', async (req, res) => {

    // query database for all pokemon
    let sqlResults = await client.query("select * from pokemon order by id asc;");

    // respond with HTML page displaying all pokemon
    res.render("home", {pokemon: sqlResults.rows});
  });

  app.post('/', async (req, res) => {
    // console.log(req.body);
    let values = [
      req.body.name,
      req.body.img,
      req.body.height,
      req.body.weight
    ];
    // insert pokemon without num
    await client.query(`insert into pokemon (name, img, weight, height) values ($1, $2, $3, $4);`, values);

    const sqlResults = await client.query(`select id from pokemon where name='${req.body.name}';`);
    // console.log(sqlResults.rows[0]["id"]);
    let id = sqlResults.rows[0]["id"];
    let num = id.toString();
    // create num and update sql statement
    while (num.length < 3) {
      num = "0" + num;
    }
    try {
      await client.query(`update pokemon set num='${num}' where id=${id};`);
    } catch(err) {
      console.log(err.stack);
    }

    res.redirect("/");
  });

  app.get('/new', async (req, res) => {
    res.render("new");
  });

  app.get('/:id/edit', async (req, res) => {
    let sqlResults = await client.query(`select * from pokemon where id=${req.params.id};`);
    console.log(sqlResults.rows[0]);
    res.render("edit", {pokemon: sqlResults.rows[0]});
  });

  app.put('/:id', async (req, res) => {
    let id = req.params.id;
    console.log(req.body);
    // let values = [req.body.num, req.body.name, req.body.img, req.body.height, req.body.weight];
    try {
      await client.query(`update pokemon set num='${req.body.num}', name='${req.body.name}', img='${req.body.img}', weight='${req.body.weight}', height='${req.body.height}' where id=${req.params.id};`);
    } catch(err) {
      console.log(err.stack);
    }

    res.redirect('/');
  });

  app.get('/:id', async (req, res) => {
    try {
      let sqlResults = await client.query(`select * from pokemon where id=${req.params.id};`);
    } catch(err) {
      console.log(err.stack);
    }

    res.render("pokemon", {pokemon: sqlResults.rows[0]});
  });



  app.get('/new', (request, response) => {
    // respond with HTML page with form to create new pokemon
    response.render('new');
  });

  app.post('/pokemon', (req, response) => {
    let params = req.body;

    const queryString = 'INSERT INTO pokemon(name, height) VALUES($1, $2)'
    const values = [params.name, params.height];

    client.connect((err) => {
      if (err) console.error('connection error:', err.stack);

      client.query(queryString, values, (err, res) => {
        if (err) {
          console.error('query error:', err.stack);
        } else {
          console.log('query result:', res);

          // redirect to home page
          response.redirect('/');
        }
        client.end();
      });
    });
  });
}
