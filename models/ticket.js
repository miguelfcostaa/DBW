const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ticketSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    resposta: {
        type: String,
        required: false
    },
    estado: {
        type: String,
        required: true
    },
    agente:{
        type: String,
        required: true
    }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;