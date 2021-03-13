'use strict'

var express = require("express");
var productoControlador = require("../controladores/producto.controlador")


var md_autorizacion = require("../middlewares/authenticated");

var api = express.Router()

api.post('/agregarProducto/:id', md_autorizacion.ensureAuth, productoControlador.agregarProducto)
api.put('/editarProducto/:id', md_autorizacion.ensureAuth, productoControlador.editarProducto)
api.delete('/eliminarProducto/:id', md_autorizacion.ensureAuth, productoControlador.eliminarProducto)
api.get('/mostrarProductos',md_autorizacion.ensureAuth, productoControlador.mostrarProductos)



module.exports = api