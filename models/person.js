/* eslint-disable no-undef */
const mongoose = require('mongoose')

mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

const url = process.env.MONGODB_URI

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {console.log('Connected to mongodb')})
    .catch(error => {
        console.log(`Error while connecting to mongoDB ${error.message}`)
    })

const phoneSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true, minlength: 3 },
    number: { type: String, required: true, minlength: 8 }
})

phoneSchema.set('toJSON', {
    transform: (doc, returned) => {
        returned.id = returned._id.toString(),
        delete returned._id
        delete returned.__v
    }
})

module.exports = mongoose.model('People', phoneSchema)