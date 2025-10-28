require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/contact')

const app = express()

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

morgan.token('info', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : '' 
})

app.use(express.json())
app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :info'))

app.get('/api/persons', (request, response) => {
    Person.find({}).then(person => {
        response.json(person)
    })
})

app.get('/info', (request, response, next) => {
    let date = new Date()

    Person.countDocuments({})
        .then(count => {
            response.send(`<div>Phonebook has info for ${count} people</div><div>${date}</div>`)
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(result => {
            if (!result) {
                return response.status(404).end()
            }

            response.json(result)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

// const generatedId = () => {
//     const randomId = Date.now() + Math.floor(Math.random() * 1000)
// 
//     return randomId
// }

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    // if (persons.find(p => p.name.toLowerCase() === body.name.toLowerCase())) {
    //     return response.status(409).json({
    //         error: 'name must be unique'
    //     })
    // }

    const person = new Person({
        name: body.name,
        number: body.number,
    })
    
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person.findById(request.params.id)
        .then(contact => {
            if (!contact) {
                response.status(404).end()
            }

            if (contact.name.toLowerCase() === name.toLowerCase()) {
                contact.name = name
                contact.number = number

                return contact.save().then(updatedContact => {
                    response.json(updatedContact)
                })
            }
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})  
