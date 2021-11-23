'use strict';
const express = require('express');
const exphbs  = require('express-handlebars');

const app = express();

// enable the req.body object - to allow us to use HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// enable the static folder...
app.use(express.static(__dirname + '/public'));

const pg = require('pg');
const Pool = pg.Pool;

// use a SSL connection
let useSSL = false;
const local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
  useSSL = {rejectUnauthorized: false};
}

// database connection to use
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:moddy123@localhost:5432/avo_shopper';

const pool = new Pool({
  connectionString,
  ssl: useSSL,

});

const AvoShopper = require('./avo-shopper');
const avoShopper = AvoShopper(pool);

// add more middleware to allow for templating support

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

let counter = 0;

// display top five deals
app.get('/', async function(req, res) {

var listFive = await avoShopper.topFiveDeals()

	res.render('index', {
		listFive
	});
});

// display list
app.get('/shopList', async function (req, res) {
	try {
  
	  var shopList = await avoShopper.listShops()
		  
		  
		  res.render('shopList', { shopList })
  	} catch (e) {
	  console.log('Catch an error: ', e)
	}
  });
  
//show deals
  app.get('/showDeals/:name/', async function (req, res) {
// get data using the name 
	var shop = req.params.name
	var id = await avoShopper.getId(shop)
	var getData = await avoShopper.dealsForShop(id)
	console.log(getData)

	res.render('showDeals',{getData, shop})
  });

// add shop
app.get('/addShop', function(req, res) {
	res.render('addShop', {
	});
});

app.post('/addShop', async function(req, res) {
	// console.log(req.body)
	await avoShopper.createShop(req.body.shop_name)
	res.redirect('/');
});


// start  the server and start listening for HTTP request on the PORT number specified...

const PORT =  process.env.PORT || 3019;

app.listen(PORT, function() {
	console.log(`AvoApp started on port ${PORT}`)
});