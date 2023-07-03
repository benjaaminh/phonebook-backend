require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('object', function getObject (req,res) {   
  req.object=JSON.stringify(req.body)
  return req.object
})

app.use(express.json())
app.use(cors())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :object'))

const date = new Date()


let persons=
[
  
]
const generateId = () => {
  const id = Math.floor(Math.random()*100)
  return id
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }else if(!body.number){
    return response.status(400).json({
      error: 'number missing'
    })
  }

  const person = new Person( {
    name: body.name,
    number: body.number,
    id: generateId(),
  })
const nameList = persons.map(person=>person.name)

  if (nameList.includes(person.name)){
    return response.status(400).json({
      error:'name must be unique'
    })
  }

 person.save().then(savedPerson=>{
  response.json(savedPerson)
 })
})


app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p>
  <p>${date}`)
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})