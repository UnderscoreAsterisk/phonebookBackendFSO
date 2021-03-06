require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('content', (req) => JSON.stringify(req.body))
app.use(morgan(
    ':method :url :status :res[content-length] - :response-time ms :content',
    {
        skip: (req) => req.method !== 'POST'
    }))

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3001

app.get('/api/persons', (request, response) => {
    console.log('Responding to getAll on the main route')
    person.find({}).then(people => {
        response.json(people)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    person.findById(req.params.id).then(note => {
        if(note) res.json(note)
        else res.status(404).end()
    }).catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    person.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .then(updatedPerson => res.json(updatedPerson))
        .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
    console.log('Fetching info')
    person.find({}).then(persons => {
        res.send(`<p>We have information about ${persons.length} people</p><p>${Date()}</p>`)
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    person.findByIdAndRemove(req.params.id).then(
        () => res.status(204).end()
    ).catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    const contact = req.body

    const newEntry = {
        name: contact.name,
        number: contact.number
    }

    const entry = new person(newEntry)
    entry.save()
        .then(savedEntry => {res.json(savedEntry)})
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'Unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if(error.name === 'CastError') {
        response.status(400).send({ error: 'Malformed ID' })
    } else if(error.name === 'ValidationError') {
        response.status(400).send({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})