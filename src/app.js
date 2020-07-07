require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { v4: uuid } = require('uuid')
const { NODE_ENV } = require('./config')

const app = express()

// to store data in memory (in lieu of database)
const users = [];

const morganOption = (NODE_ENV === 'production') 
  ? 'tiny' 
  : 'dev';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(express.json()) // built-in middleware to enable parsing of req.body

app.get('/', (req, res) => {
  res.send('Hello, world!')
})

app.post('/', (req, res) => {
  console.log(req.body)
  res.send('POST Request received')
})

app.post('/user', (req, res) => {
  // get the data (newsletter is optional)
  const { username, password, favouriteClub, newsletter=false } = req.body;

  // validation
  if(!username) {
    return res
      .status(400)
      .send('Username required')
  }
  if(!password) {
    return res
      .status(400)
      .send('Password required')
  }
  if(!favouriteClub) {
    return res
      .status(400)
      .send('Favourite Club required')
  }

  if(username.length < 6 || username.length > 20) {
    return res
      .status(400)
      .send('Username must be between 6 and 20 characters')
  }

  if(password.length < 8 || password.length > 36) {
    return res
      .status(400)
      .send('Password must be between 8 and 36 characters')
  }

  // password contains digit, using a regex here
  if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
    return res
      .status(400)
      .send('Password must conttain at least one digit')
  }

  const clubs = [
    'Cache Valley Stone Society',
    'Ogden Curling Club',
    'Park City Curling Club',
    'Salt City Curling Club',
    'Utah Olympic Oval Curling Club'
  ];

  if (!clubs.includes(favouriteClub)) {
    return res
      .status(400)
      .send('Not a valid club')
  }

  // at this point all validation passed

  const id = uuid();
  const newUser = {
    id, 
    username,
    password,
    favouriteClub,
    newsletter
  };

  users.push(newUser)
  console.log(users)

  res.send('All validation passed')

})


app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app