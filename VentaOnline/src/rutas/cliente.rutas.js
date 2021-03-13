'use strict'

var express = require("express");
var clienteControlador = require("../controladores/cliente.controlador");

var md_autorizacion = require("../middlewares/authenticated");

var api = express.Router();

api.post('/agregarCliente',md_autorizacion.ensureAuth, clienteControlador.agregarCliente);
api.post('/iniciarSesion', clienteControlador.iniciarSesion);
api.get('/productoCategoria',md_autorizacion.ensureAuth, clienteControlador.buscarCategoria);
api.get('/nombreProducto', clienteControlador.nombreProductoB);
api.get('/productoMasVendido', clienteControlador.masVendidoP);
api.put('/carrito',md_autorizacion.ensureAuth, clienteControlador.carrito);
api.put("/editarPerfil/:id",md_autorizacion.ensureAuth,clienteControlador.editarPerfil);
api.delete("/eliminarPerfil/:id",md_autorizacion.ensureAuth,clienteControlador.eliminarPerfil)

module.exports = api;