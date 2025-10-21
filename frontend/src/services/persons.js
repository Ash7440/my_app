import axios from "axios"

const baseUrl = '/api/persons'

const getAll = () => {
    const request = axios.get(baseUrl)
    return request.then(response => response.data)
}

const addNew = newObject => {
    return axios.post(baseUrl, newObject)
}

const removeOne = (id) => {
    return axios.delete(`${baseUrl}/${id}`)
}

const updateOne = (id, newObject) => {
    const request = axios.put(`${baseUrl}/${id}`, newObject)
    return request.then(response => response.data)
}

export default {
    getAll,
    addNew,
    removeOne,
    updateOne
}