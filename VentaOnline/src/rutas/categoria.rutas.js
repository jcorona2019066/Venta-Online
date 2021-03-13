'use strict'

var express = require('express');
var categoriaControlador = require('../controladores/categoria.controlador');

 
var md_autorizacion = require("../middlewares/authenticated")

var api = express.Router()
api.post('/agregarCategoria', md_autorizacion.ensureAuth, categoriaControlador.agregarCategoria);
api.get('/mostrarCategorias', categoriaControlador.mostrarCategorias);
api.put('/editarCategoria/:id', md_autorizacion.ensureAuth, categoriaControlador.editarCategoria)
api.delete('/eliminarCategoria/:id',md_autorizacion.ensureAuth, categoriaControlador.eliminarCategoria);

module.exports = api

