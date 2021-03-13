'use strict'

var Producto = require("../modelos/producto.modelo");

function agregarProducto(req, res) {
    var productoModel = new Producto()
    var params = req.body;

    if (req.user.rol != 'administrador') {
        return res.status(500).send({ mensaje: 'No posee los permisos para agregar un producto' })
    }
    delete params.ventas;

    if (params.nombre && params.stock) {
        productoModel.nombre = params.nombre
        productoModel.stock = params.stock
        productoModel.ventas = 0
        productoModel.categoriaProducto = req.params.id;

        Producto.find({ nombre: params.nombre }).exec((err, productoEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })

            if (productoEncontrado && productoEncontrado.length >= 1) {
                return res.status(500).send({ mensaje: 'El producto ya existe' })

            } else {

                productoModel.save((err, productoGuardado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error al guardar el producto' })

                    if (productoGuardado) {
                        return res.status(200).send({ productoGuardado })
                    } else {
                        return res.status(500).send({ mensaje: 'Error al guardad el producto' })
                    }

                })
            }
        })

    } else {
        return res.status(500).send({ mensaje: 'Ingrese todos los parametros necesarios' })

    }

}

function editarProducto(req, res) {
    var idProducto = req.params.id;
    var params = req.body

    if (req.user.rol != 'administrador') {
        return res.status(500).send({ mensaje: 'No posee los permisos para editar un producto' })
    }

    delete params.ventas
    delete params.categoriaProducto

    Producto.find({ nombre: params.nombre }).exec((err, productoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'error en la peticion' })

        if (productoEncontrado && productoEncontrado.length >= 1) {
            return res.status(500).send({ mensaje: 'Ya existe ese producto' })

        } else {
            Producto.findByIdAndUpdate(idProducto, params, { new: true }, (err, productoActualizado) => {
                if (err) return res.status(500).send({ mensaje: 'Error al actualizar el producto' })
                if (!productoActualizado) return res.status({ mensaje: 'No se han encontrado los datos' })
                if (productoActualizado) return res.status(200).send({ productoActualizado })

            })

        }

    })


}

function eliminarProducto(req, res) {
    var idProducto = req.params.id;

    if (req.user.rol != 'administrador') {
        return res.status(500).send({ mensaje: 'No posee el permiso para eliminar el producto' })

    }

    Producto.findByIdAndDelete(idProducto, (err, productoEliminado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!productoEliminado) return res.status(500).send({ mensaje: 'No existen los datos' })
        if (productoEliminado) return res.status(200).send({ productoEliminado})
    })

}

function mostrarProductos(req, res) {
    if (req.user.rol != 'administrador') {
        return res.status(500).send({ mensaje: 'No tiene los permisos para ver los productos' })
    }

    Producto.find().exec((err, productosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!productosEncontrados) return res.status(500).send({ mensaje: 'no hay productos' });

        if (productosEncontrados) return res.status(200).send({ productosEncontrados })
    })
}


module.exports = {
    agregarProducto,
    editarProducto,
    eliminarProducto,
    mostrarProductos,
}