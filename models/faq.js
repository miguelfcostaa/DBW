const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const faqSchema = new mongoose.Schema({
    categoria: {
        type: String,
        required: true
    },
    pergunta: {
        type: String,
        required: true
    },
    resposta: {
        type: String,
        required: false
    },
    pinned: {
        type: Boolean,
        required: false
    }
});

const Faq = mongoose.model('Faq', faqSchema);

module.exports = Faq;
