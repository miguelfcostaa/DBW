const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const msgRapidaSchema = new mongoose.Schema({
    mensagem: {
        type: String,
        required: false
    },
    agente: {
        type: String,
        required: true
    }
});

const msgRapida = mongoose.model('msgRapida', msgRapidaSchema);

module.exports = msgRapida;
