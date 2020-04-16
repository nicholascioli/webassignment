// Needed imports
const express = require("express"); // Routing middlewear
const app = express(); // Initialize a server called app
const bodyParser = require("body-parser"); // Used in conjunction with express
const dbClient = require("mongodb").MongoClient; // The client to the db
const path = require("path"); // A way to generate platform-agnostic paths

// The file with user supplied queries
const queries = require("./queries");

// Allow express to parse the body of POSTs
const jsonParser = bodyParser.json();

const {
	MONGO_USERNAME,
	MONGO_PASSWORD,
	MONGO_HOSTNAME,
	MONGO_PORT,
	MONGO_DB,
} = process.env;

// Some constants used throughout the program
const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
const PORT = 3000;

// Forward declare the variable `db` to hold our database when it opens
let db;

// Attempt to connect to the database locally and use the 'db' database, which
//   contains the collection HW6
dbClient.connect(url, function (err, database) {
	// If we received an error on connecting to the server, throw it as
	//   an exception.
	if (err) throw err;

	// If we have made it this far, then we have access to the database through the
	//   `database` variable. So we capture it in the locally defined variable `db`
	//   defined earlier.
	db = database.db("db");

	// Open up a web server to respond to our requests for db info
	app.listen(PORT, function () {
		console.log("listening on 3000");
	});
});

// Setup the web server to use bodyParser as a way to parse the body of web requests
app.use(function (req, res, next) {
	console.log(new Date() + " -> " + req.method + " " + req.path);
	next();
});

// Publically expose the folder 'public'
app.use(express.static("public"));

// ---------------------------------------
// Web routes
// ---------------------------------------

// Respond to a request for the home page with our index.html
app.get("/", (req, res) => {
	res.render(path.join("public", "index.html"));
});

// A get request to /api/company/contact responds with a list of companies contact info:
//   Name | Category | Web Page | Email | Phone Number
app.get("/api/company/contact", (req, res) => {
	queries.getCompaniesContact(db).toArray(function (err, result) {
		if (err) {
			console.error(err);
			return res.status(501).json({ result: err });
		}

		res.json({ result: result });
	});
});

// A delete request to /api/company/:id will delete the company with the specified ID
app.delete("/api/company/:id", async (req, res) => {
	let id = req.params.id;
	queries.deleteCompany(db, id).then((doc) => {
		res.json({ result: doc.deletedCount === 1 ? "OK" : "FAILED" });
	});
});

// A post request to /api/company/new will create a new company with the specified fields
app.post("/api/company/new", jsonParser, async (req, res) => {
	queries
		.insertCompany(
			db,
			req.body.companyFormName,
			req.body.companyFormHomePage,
			req.body.companyFormCategoryCode,
			req.body.companyFormEmail,
			req.body.companyFormPhoneNumber
		)
		.then((result) => {
			if (result.insertedCount !== 1) {
				console.error(err);
				return res.status(501).json({ result: err });
			}

			res.json({ result: "OK" });
		});
});

// Here we separate the function used for search so that an empty searchText is allowed
async function search(req, res, field, text) {
	queries.searchCompany(db, field, text).toArray((err, results) => {
		if (err) {
			console.error(err);
			return res.status(501).json({ result: err });
		}

		res.json({ result: results });
	});
}
app.get("/api/company/search/:field/", (req, res) =>
	search(req, res, req.params.field, "")
);
app.get("/api/company/search/:field/:text", (req, res) =>
	search(req, res, req.params.field, req.params.text)
);
