'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UsuarioSchema = Schema({
    nombre: String,
    apellido: String,
    email: String,
    password: String,
    rol: String
})

module.exports = mongoose.model('usuarios', UsuarioSchema);