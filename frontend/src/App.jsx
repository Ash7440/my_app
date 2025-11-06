
import { useState, useEffect } from 'react'
import personService from './services/persons'
import './index.css'

const Notification = ({message}) => {
  if (!message) return null
  
  return message.status === 'success' ? <div className='info'>{message.text}</div> : <div className='error'>{message.text}</div>
}

const Contact = ({person, handleDelete}) => 
<li>
  {person.name} {person.number} 
  <button type='button' onClick={() => handleDelete(person.id)}>
    delete
  </button>
</li>

const Filter = ({tofind, handle}) => {

  return (
    <div>
      filter shown with <input value={tofind} onChange={handle}/>
    </div>  
  )
}

const Form = ({addPerson, newName, newNumber, handlePersonChange, handleNumberChange}) => {

  return (
    <form onSubmit={addPerson}>
      <div>
        name: <input value={newName} onChange={handlePersonChange}/>
      </div>
      <div>
        number: <input value={newNumber} onChange={handleNumberChange}/>
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({contactsToShow, handleDelete}) => 
  <ul>
    {contactsToShow.map(person => <Contact key={person.id} person={person} handleDelete={handleDelete}/>)}
  </ul>

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [tofind, setFind] = useState('')
  const [message, setMessage] = useState(null)
  
  const hook = () => {
    personService
      .getAll()
      .then(initialNotes => {
        setPersons(initialNotes)
      })
  }

  useEffect(hook, [])

  const addPerson = (event) => {
    event.preventDefault()

    const existingPerson = persons.find(person => person.name === newName)

    if (existingPerson) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const changedPerson = {...existingPerson, number: newNumber} 

        personService
          .updateOne(existingPerson.id, changedPerson)
          .then((returnedNote) => {
            setPersons(persons.map(person => person.id !== existingPerson.id ? person : returnedNote))
            setMessage({
              text: `Person ${existingPerson.name} has been changed!`,
              status: 'success'})
            setTimeout(() => { setMessage(null) }, 5000)
            setNewName('')
            setNewNumber('')
          })
          .catch(error => {
            setMessage(`Person ${existingPerson.name} has already been removed from server!`)
            setTimeout(() => { setMessage(null) }, 5000)
            setPersons(persons.filter(person => person.id !== existingPerson.id))
          })
      }
    } else {
        const personObject = {
        name: newName,
        number: newNumber
      }

      personService
        .addNew(personObject)
        .then(response => {
          setPersons(persons.concat(response.data))
          setMessage({
            text: `Person ${newName} has been added`,
            status: 'success'
          })
          setTimeout(() => { setMessage(null) }, 5000)
          setNewName('')
          setNewNumber('')
        })
        .catch(error => {
          console.log(error.response.data.error)
          setMessage({
            text: error.response.data.error,
            status: 'error'
          })
          setTimeout(() => { setMessage(null) }, 5000)
        })
    }
  }

  const removePerson = (id) => {
    const person = persons.find(p => p.id === id)
    if (window.confirm(`Delete ${person.name}?`)) {
      personService
      .removeOne(id)
      .then(() => {
        setPersons(persons.filter(p => p.id !== id))
      })
    }
  }
  
  const handlePersonChange = (event) => {
    console.log(event.target.value)
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => setNewNumber(event.target.value)

  const handleFind = (event) => setFind(event.target.value)

  const contactsToShow = tofind ? persons.filter(person => person.name.toLowerCase().includes(tofind.toLowerCase())) : persons
  
  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message}/>
      <Filter tofind={tofind} handle={handleFind}/>
      <h3>Add new</h3>
      <Form addPerson={addPerson} newName={newName} newNumber={newNumber} handlePersonChange={handlePersonChange} handleNumberChange={handleNumberChange}/>
      <h2>Numbers</h2>
      <Persons contactsToShow={contactsToShow} handleDelete={removePerson}/>
    </div> 
  )
}

export default App  