const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to ', url)

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

const dataSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: [3, 'Name must have 3 and more characters'],
        required: [true, 'Name is required'],
    },
    number: {
        type: String,
        minLength: [8, 'Number must have at least 8 characters'],
        validate: {
            validator: (v) => {
                return /^\d{2,3}-\d{6,}$/.test(v)
            },
            message: 'Nuber must have format 000-00000 or 00-000000'
        },
        required: [true, 'Number is required'],
    }
})

dataSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('person', dataSchema)