require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const person = require('./models/person')
const { response } = require('express')

const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('content', (req) => JSON.stringify(req.body))
app.use(morgan(
    ':method :url :status :res[content-length] - :response-time ms :content',
    {
        skip: (req, res) => req.method !== 'POST'
    }))

const PORT = process.env.PORT || 3001

app.get('/api/persons', (request, response) => {
    console.log("Responding to getAll on the main route")
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
    person.findByIdAndUpdate(req.params.id, req.body, {new: true})
        .then(updatedPerson => res.json(updatedPerson))
        .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
    console.log("Fetching info")
    person.find({}).then(persons => {
        res.send(`<p>We have information about ${persons.length} people</p><p>${Date()}</p>`)
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    person.findByIdAndRemove(req.params.id).then(
        result => res.status(204).end()
    ).catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    const contact = req.body
    if(!contact.name || !contact.number) {
        console.log("Received malformed contact")
        return res.status(400).json({"error": "Check if name and number exist"})
    }

    console.log(`Received ${contact.name} ${contact.number}`)

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
    response.status(404).send({error: "Unknown endpoint"})
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if(error.name === 'CastError') {
        return response.status(400).send({error: "Malformed ID"})
    }

    next(error)
}

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})