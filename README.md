# Web Assignment

This project should be automatically pulled from the supplied `Dockerfile` on Blackboard.

## Building

To build, run the following:

```bash
npm install # or yarn
```

## Running

Run `node server.js` to start the server. The web interface can be accessed at
`http://localhost:3000`.

## Published Routes

The exposed routes are as follows:

| Method | Route                             | Action                                    |
| ------ | --------------------------------- | ----------------------------------------- |
| GET    | /api/company/contact              | Gets at most 100 companies' contact info  |
| POST   | /api/company/new                  | Inserts a new company into the DB         |
| DELETE | /api/company/:id                  | Deletes the company with the specified ID |
| GET    | /api/company/search/:field/:value | Searches for a company using the field and its value. Value can be empty |

## What you need to change

The only file you should edit is `queries.js`. The contents of that file contain
different functions for performing each of the 4 operations required in the assignment.

Their syntax follows that of MongoDB, with the only difference being that collections
must be accessed using the `db.collection("collection_name")` instead of the
`db.collection_name` syntax.