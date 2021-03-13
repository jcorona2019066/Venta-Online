'use strict'


const express = require("express");
const app = express();
const bodyParser = require("body-parser");


var usuario_rutas = require("./src/rutas/usuario.rutas");
var cliente_rutas = require("./src/rutas/cliente.rutas")
var categoria_rutas = require("./src/rutas/categoria.rutas")
var producto_rutas = require("./src/rutas/producto.rutas")
var factura_rutas = require("./src/rutas/factura.ruta")


app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


app.use('/api', usuario_rutas, cliente_rutas,categoria_rutas, producto_rutas, factura_rutas);


module.exports = app

