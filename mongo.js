const mongoose = require('mongoose')

let password = null
let entryName = null
let entryNumber = null

if(process.argv.length < 3 || (process.argv.length > 3 && process.argv.length < 5)) {
    console.log(`Usage: node mongo.js <password> [<name> <number>]`)
    process.exit(-1)
}

if (process.argv.length == 3) {
    password = process.argv[2]
} else {
    password = process.argv[2]
    entryName = process.argv[3]
    entryNumber = process.argv[4]
}

password = process.argv[2]
entryName = process.argv[3]
entryNumber = process.argv[4]

const database = 'phonebook-app'

const url = `mongodb+srv://saxyUser123:${password}@cluster0.g6b0k.mongodb.net/${database}?retryWrites=true&w=majority`

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})

const phoneSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Entry = mongoose.model('Entry', phoneSchema)

if (entryName && entryNumber) {
    
    const entry = new Entry({
        name: entryName,
        number: entryNumber
    })
    
    entry.save().then(result => {
        console.log(`Saved ${entryName}, number: ${entryNumber} to phonebook`)
        mongoose.connection.close()
    })
} else {
    Entry.find({}).then(result => {
        console.log("Phonebook:")
        result.forEach(entry => {
            console.log(`${entry.name} ${entry.number}`)
        })
        mongoose.connection.close()
    })
}
