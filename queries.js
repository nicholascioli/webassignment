const mongo = require("mongodb");

// Replace the template strings with their respective NoSQL queries
//   Hint: You can't use db.HW6 here, only db.collection("HW6")
module.exports = {
	getCompaniesContact: function (db) {
		// Insert the Mongo query needed to get at most 100 companies with the following fields:
		//   name,
		//   category_code,
		//   homepage_url,
		//   email_address,
		//   phone_number

		return // ...
	},

	deleteCompany: function (db, id) {
		// Insert the Mongo query needed to delete a company given its ID.
		//   Hint: To convert a string ID to the needed Mongo.ObjectID, use
		//   mongo.ObjectID(...)

		return // ...
	},

	insertCompany: function (db, name, homepage_url, category_code, email_address, phone_number) {
		// Insert the Mongo query needed to insert a company given the following fields:
		//   name,
		//   category_code,
		//   homepage_url,
		//   email_address,
		//   phone_number

		return // ...
	},

	searchCompany: function (db, field, searchText) {
		// Insert the Mongo query needed to search for a company by a field
		// Hint: Objects in JS do not allow you to use a variable as a key, so construct
		//   the object first, and then use member access [] to insert the value
		// ex.
		// let search = {};
		// search[key] = val;

		return // ...
	}
};