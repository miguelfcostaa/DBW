const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    apelido: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    estado: {
        type: String
    }
});

userSchema.methods.verifyPassword = function (password) {
    return password === this.password;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
