const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

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

let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 5
    }
]

const generateId = () => {
    let new_id = 1
    
    do { new_id = Math.floor(Math.random()*1000000) }
    while (persons.find((n) => n.id === new_id))
    
    return new_id
}

app.get('/api/persons', (request, response) => {
    console.log("Responding to getAll on the main route")
    response.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const note = persons.find((n) => n.id === id)
    if(note) 
        res.json(note)
    else return res.status(404).end()
})

app.get('/info', (req, res) => {
    console.log("Fetching info")
    res.send(`<p>We have information about ${persons.length} people</p><p>${Date()}</p>`)
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter((n) => n.id !== id)

    return res.status(204).end()
})

app.post('/api/persons', (req, res) => {
    const contact = req.body
    if(!contact.name || !contact.number) {
        console.log("Received malformed contact")
        return res.status(400).json({"error": "Check if name and number exist"})
    }

    console.log(`Received ${contact.name} ${contact.number}`)

    if(persons.find((p) => contact.name === p.name)) {
        console.log(`${contact.name} already exists`)
        return res.status(400).json({"error": `${contact.name} already exists`})
    }

    const newEntry = {
        ...contact,
        id: generateId()
    }

    persons = persons.concat(newEntry)
    res.json(newEntry)    
})

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})