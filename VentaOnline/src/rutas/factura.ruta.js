'use strict'

var express = require('express')
var facturaControlador = require('../controladores/factura.controlador')

var md_autorizacion = require("../middlewares/authenticated");

var api = express.Router();

api.get('/mostrarFacturas/:id', md_autorizacion.ensureAuth,facturaControlador.mostrarFacturas);
api.get('/mostrarProductoFactura/:id', md_autorizacion.ensureAuth, facturaControlador.mostarProductosFactura)
api.get('/productoAgotado',md_autorizacion.ensureAuth, facturaControlador.productosAgotados)
api.get('/productoMasVendido', facturaControlador.masVendidoP);

module.exports = api