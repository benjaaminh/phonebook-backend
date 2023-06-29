const express = require('express')
const app = express()
var morgan = require('morgan')

morgan.token('object', function getObject (req,res) {   
  req.object=JSON.stringify(req.body)
  return req.object
})

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :object'))

const date = new Date()


let persons=
[
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
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

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }
const nameList = persons.map(person=>person.name)

  if (nameList.includes(person.name)){
    return response.status(400).json({
      error:'name must be unique'
    })
  }

  persons = persons.concat(person)

  response.json(person)
})


app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {  
     response.json(person)  }
      else {    
        response.status(404).end()  }

})

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p>
  <p>${date}`)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})