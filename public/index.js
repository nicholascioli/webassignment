// Disable form page reloading
function handleForm(event) { event.preventDefault(); }
document.getElementById("insertForm").addEventListener('submit', handleForm);
document.getElementById("searchForm").addEventListener('submit', handleForm);

// Allow for searching with enter
document.getElementById("searchText").onkeydown = e => {
	if (e.key === "Enter") {
		searchCompany();
	}
};

/**
 * fetch_db
 *
 * Performs a fetch operation on the express server endpoint /api
 *
 * @param {string} endpoint The API endpoint to fetch from
 * @param {function} cb Callback to perform with results of database
 *
 * @returns The results of the fetch
 */
async function fetch_db(endpoint, cb, opts = {}) {
	let results = await fetch("/api/" + endpoint, opts);
	results = await results.json();

	cb(results.result);
}

/**
 * generate_table
 *
 * Generates a DOM table using the keys of each row as the header
 *
 * @param {array} elems An array of elements to create a table out of
 *
 * @returns The completed table DOM element
 */
function generate_table(elems) {
	let keys = Object.keys(elems && elems.length > 0 ? elems[0] : {});
	if (keys.length === 0) {
		let empty = document.createElement("em");
		empty.innerText = "No results found...";

		return empty;
	}

	// Header
	let table = document.getElementById("tableTemplate").content.cloneNode(true);
	let row = table.querySelector("tr");
	for (let i = 0; i != keys.length; ++i) {
		// Skip _id
		if (keys[i] === "_id") continue;

		let col = document.createElement("th");
		col.scope = "col";
		col.innerText = keys[i];

		row.appendChild(col);
	}

	// Add delete
	let del_col = document.createElement("th");
	del_col.scope = "col";
	del_col.innerText = "Delete?";
	row.appendChild(del_col);

	// Data
	let insert_into = table.querySelector("tbody");
	for (let i = 0; i != elems.length; ++i) {
		let elem = elems[i];
		let row = document.createElement("tr");
		row.id = elem._id;

		for (let j = 0; j != keys.length; ++j) {
			if (keys[j] === "_id") continue;
			if (typeof elem[keys[j]] === "object" || elem[keys[j]] === "[Object object]")
				elem[keys[j]] = "[redacted]";
			if (elem[keys[j]].length > 40)
				elem[keys[j]] = elem[keys[j]].substring(0, 40 - 3) + "...";
			let td = document.createElement("td");
			td.innerText = elem[keys[j]];

			row.appendChild(td);
		}

		// Add delete
		let del = document.createElement("td");
		let del_btn = document.createElement("btn");
		del_btn.classList.add("btn", "btn-danger")
		del_btn.innerText = "⨯";
		del_btn.onclick = () => deleteCompany(elem._id);

		del.appendChild(del_btn);
		row.appendChild(del);

		// Add the row to the table
		insert_into.appendChild(row);
	}

	return table;
}

/**
 * getCompanyContact
 *
 * Fetches the company contact info. Correlates to getCompaniesContact in queries
 */
async function getCompanyContact() {
	const spot = document.getElementById("companyContact");

	fetch_db("company/contact", function (res) {
		let table = generate_table(res);
		spot.replaceChild(table, spot.firstElementChild);
	});
}

/**
 * deleteCompany
 *
 * Deletes a company given its id. Correlates to deleteCompany in queries
 *
 * @param {string} id The ID of the company to delete
 */
async function deleteCompany(id) {
	let row = document.getElementById(id);

	fetch_db("company/" + id, (res) => {
		if (res !== "OK") {
			throw "Delete failed: " + res;
		}

		// Delete the row from the interface
		row.parentNode.removeChild(row);
	}, {
		method: "delete"
	});
}

/**
 * createCompany
 *
 * Creates a company given the information in the insertCompany form. Correlates to insertCompany in queries
 */
async function createCompany() {
	let fields = document.forms["insertForm"].getElementsByTagName("input");

	// Extract all of the fields
	let values = {};
	for (let i = 0; i !== fields.length; ++i) {
		let key = fields[i].id;
		let val = fields[i].value;

		// Save the value
		values[key] = val;
	}

	// Post the result
	fetch_db("company/new", (res) => {
		if (res !== "OK")
			throw res;

		// When we get a response, clear the inputs
		for (let i = 0; i !== fields.length; ++i) {
			fields[i].value = "";
		}
	}, {
		method: "post",
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(values)
	});
}

/**
 * searchCompany
 *
 * Searches for matching companies to the field - search text. Correlates to searchCompany in queries
 */
async function searchCompany() {
	let field = document.getElementById("fieldSelect").value;
	let search = document.getElementById("searchText").value;
	if (field === "INVALID") {
		// TODO: Validation
		return;
	}

	const spot = document.getElementById("searchResults");
	fetch_db("company/search/" + field + "/" + search, (res) => {
		console.log(res);
		let table = generate_table(res);
		spot.replaceChild(table, spot.firstElementChild);
	});
}