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


app.post('/api/persons', (request, response,next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'fail: name missing'
    })
  }else if(!body.number){
    return response.status(400).json({
      error: 'fail: number missing'
    })
  }

  const person = new Person( {
    name: body.name,
    number: body.number,
    //id: generateId(),
  })


  Person.find({}).then(persons => {
    const nameList= persons.map(p => p.name)
    if(nameList.includes(person.name)){
      Person.findByIdAndUpdate(person.id, person, { new: true })
        .then(updatedNumber => {
          response.json(updatedNumber)
        })
        .catch(error => next(error))
    }
    else{
      person.save().then(savedPerson => {
        response.json(savedPerson)
      }).catch(error => next(error))
    }
  })


})

app.put('/api/persons/:id', (request, response, next) => {
  const { name,number } =request.body

  Person.findByIdAndUpdate(request.params.id, { name,number },
    { new: true, runValidators:true, context:'query' })
    .then(updatedNumber => {
      response.json(updatedNumber)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person){
        response.json(person)
      }else{
        response.status(404).end
      }

    })
    .catch(error => {
      next(error)
    })
})

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    const length = persons.length

    response.send(`<p>Phonebook has info for ${length} people</p>
  <p>${date}`)
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)



const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})