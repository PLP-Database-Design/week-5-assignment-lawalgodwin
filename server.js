const express = require('express')
const {config} = require("dotenv")
const {promisify} = require("util")
const {createConnection} = require("mysql2")
const app = express()

config()

const dbUser = process.env.DB_USERNAME
const dbHost = process.env.DB_HOST
const dbPassword = process.env.DB_PASSWORD
const dbName = process.env.DB_NAME

const dbConnection = createConnection({
  user: dbUser,
  host: dbHost,
  password: dbPassword,
  database: dbName
})

dbConnection.connect((err) => {
  if(err) {
    console.log(`error connecting to db: ${err.message}`)
  }
})

dbConnection.query = promisify(dbConnection.query)
dbConnection.execute = promisify(dbConnection.execute)


const GET_ALL_PATIENTS = "SELECT * FROM patients;"
const FILTER_PATIENTS_BY_FIRSTNAME = "SELECT * FROM patients WHERE first_name = ?"
const GET_ALL_PROVIDERS = "SELECT * FROM providers;"
const FILTER_PROVIDERS_BY_SPECIALTY = "SELECT * FROM providers WHERE provider_specialty = ?"

// 1. Retrieve all patients
app.get("/patients", async (req, res) => {
    let result = ""
    let statusCode = 100

    try {

      const results = await dbConnection.query(GET_ALL_PATIENTS)
      statusCode = 202
      result = results
    } catch (error) {
      result = error
      statusCode = 500
    }
    finally {
      res.status(statusCode).json({result})
    }
})

//2. Retrieve all providers
app.get("/providers", async (req, res) => {
  let result = ""
  let statusCode = 100
  try {

    const results = await dbConnection.query(GET_ALL_PROVIDERS)
    result = results
    statusCode = 202
  } catch (error) {
    result = error
    statusCode = 500
  }
  finally {
    res.status(statusCode).json({result})
  }
})

// Filter patients by First Name
app.get("/patients/:first_name", async (req, res) => {
  let result = ""
  let statusCode = 100
  try {
    const {first_name} = req.params
    const results = await dbConnection.execute(FILTER_PATIENTS_BY_FIRSTNAME, [first_name])
    result = results
    statusCode = 202

  } catch (error) {
    result = error
    statusCode = 500
  }
  finally {
    res.status(statusCode).json(result)
  }
})

// 4. Retrieve all providers by their specialty
app.get("/providers/:specialty", async (req, res) => {
  let result = ""
  let statusCode = 100
  try {
    const {specialty} = req.params
    console.log(specialty)
    const results = await dbConnection.execute(FILTER_PROVIDERS_BY_SPECIALTY, [specialty])
    console.log(result)
    result = results
    statusCode = 202

  } catch (error) {
    result = error
    statusCode = 500
  }
  finally {
    res.status(statusCode).json(result)
  }
})

process.on("uncaughtException", (err) => {
  console.log(err.message)
})


// listen to the server
const PORT = 3000
app.listen(PORT, () => {
  console.log(`server is runnig on http://localhost:${PORT}`)
})