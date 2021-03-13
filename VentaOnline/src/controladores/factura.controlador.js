'use strict'

var Factura = require('../modelos/factura.modelo');
var Producto = require('../modelos/producto.modelo');



function mostrarFacturas(req, res) {
    var idusuario = req.params.id

    if (req.user.rol != 'administrador') {
        return res.status(500).send({ mensaje: 'No posee el permiso para ver las facturas' })
    }

    Factura.find({usuario: idusuario}, (err, FacturaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!FacturaEncontrada) return res.status(500).send({ mensaje: 'No tiene ninguna Factura' })
        Factura.findOne({usuario: idusuario}, (err, FacturaEncontradax) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
            if (!FacturaEncontradax) return res.status(500).send({ mensaje: 'No tiene ninguna Factura' })
            
            if(FacturaEncontrada) return res.status(200).send({ FacturaEncontrada })
        })

       
    })
}

function mostarProductosFactura(req,res) {
    var idFactura = req.params.id
    if(req.user.rol != 'administrador'){
        return res.status(500).send({mensaje:'No posee los permisos para ver la factura'})
    }
    Factura.findById(idFactura,(err,FacturaEncontrada)=>{
        if(err) return res.status(500).send({mensaje:'Error en la peticion'})
        if(!FacturaEncontrada) return res.status(500).send({mensaje:'La factura no existe'});
        if(FacturaEncontrada) return res.status(200).send({FacturaEncontrada})
    })
    
}

function Compras(req, res,tk) {
    var idusuario = tk
    
    Factura.find({usuario: idusuario}, (err, FacturaEncontrada) => {
        if (err) return ({ mensaje: 'Error en la peticion' })
        if (!FacturaEncontrada) return ({ mensaje: 'No tiene ninguna Factura' })
        Factura.findOne({usuario: idusuario}, (err, FacturaEncontradax) => {
            if (err) return ({ mensaje: 'Error en la peticion' })
            if (!FacturaEncontradax) return ({ mensaje: 'No tiene ninguna Factura' })
            
            if(FacturaEncontrada) return ({ FacturaEncontrada })
        })

       
    })
}

function productosAgotados(req, res) {
    var stockAgotado = 0
    if (req.user.rol != 'administrador') {
        return res.status(500).send({ mensaje: 'No posee el permisos para ver los productos agotados' })
    }
    Producto.find({ stock: stockAgotado }).exec((err, productoAgotado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!productoAgotado) return res.status(500).send({ mensaje: 'Los productos aun no se han agotado' })
        if (productoAgotado) return res.status(200).send({ productoAgotado })
    })

}

function masVendidoP(req, res) {
    if (req.user.rol != 'administrador') {
        return res.status(500).send({ mensaje: 'No posee el permisos para ver los productos agotados' })
    }
    Producto.find({
        ventas: { $gt: 50 }
    }, {
        _id: 0, stock: 0, categoriaProducto: 0, __v: 0
    }).sort({ ventas: -1 }).limit(100).exec((err, productosMasVendidos) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!productosMasVendidos) return res.status(500).send({ mensaje: 'Aun no hay productos con una venta mayor a 50' })
        if (productosMasVendidos) return res.status(200).send({ productosMasVendidos })
    })
}

module.exports = {
    mostrarFacturas,
    mostarProductosFactura,
    Compras,
    productosAgotados,
    masVendidoP,
}