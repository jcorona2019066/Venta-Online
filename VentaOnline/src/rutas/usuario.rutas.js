'use strict'
const { Router } = require("express");
var express = require("express");
var usuarioControlador = require("../controladores/usuario.controlador");


var md_autorizacion = require("../middlewares/authenticated");


var api = express.Router();

api.post('/agregarUsuario',md_autorizacion.ensureAuth, usuarioControlador.agregarUsuario)
api.put('/cambiarRol/:id', md_autorizacion.ensureAuth, usuarioControlador.cambiarRol)
api.put('/editarUsuario/:id', md_autorizacion.ensureAuth, usuarioControlador.editarUsuario)
api.delete('/eliminarUsuario/:id', md_autorizacion.ensureAuth, usuarioControlador.eliminarUsuario)


module.exports = api;