'use strict'

var Usuario = require('../modelos/usuario.modelo');
var Categoria = require('../modelos/categoria.modelo');
var Producto = require('../modelos/producto.modelo');
var Factura = require('../modelos/factura.modelo');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../servicios/jwt')


function iniciarSesion(req, res) {
    var params = req.body;

    Usuario.findOne({ nombre: params.nombre }, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

        if (usuarioEncontrado) {
            bcrypt.compare(params.password, usuarioEncontrado.password, (err, passVerificada) => {
                if (passVerificada) {
                    if (params.getToken === 'true') {

                        if (usuarioEncontrado.rol === 'cliente') {

                            return res.status(200).send({
                                
                                token: jwt.createToken(usuarioEncontrado)

                            })  

                        } else {
                            return res.status(200).send({
                                token: jwt.createToken(usuarioEncontrado)
                            })
                        }

                    } else {
                        usuarioEncontrado.password = undefined;
                        return res.status(200).send({ usuarioEncontrado });
                    }
                } else {
                    return res.status(500).send({ mensaje: 'El usuario no se a podido indentificar o no son los datos validos' })
                }

            })
        } else {
            return res.status(500).send({ mensaje: 'Error al buscar el Usuario' })
        }
    })

}

function agregarCliente(req, res) {
    var usuarioModel = new Usuario();
    var params = req.body;

    if (req.user.rol != 'cliente') {
        return res.status(500).send({ mensaje: 'No posee los permisos para agregar un Usuario' })
    }

    if (params.nombre && params.password) {

        usuarioModel.nombre = params.nombre,
        usuarioModel.apellido = params.apellido,
        usuarioModel.email = params.email,
        usuarioModel.rol = 'cliente',
            Usuario.find({
                $or: [
                    {nombre: params.nombre },
                    {password: params.password}
                ]
            }).exec((err, UsuarioEncontrado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

                if (UsuarioEncontrado && UsuarioEncontrado.length >= 1) {
                    return res.status(500).send({ mensaje: 'El cliente ya existe' })
                } else {
                    bcrypt.hash(params.password, null, null, (err, passwordEncriptada) => {
                        usuarioModel.password = passwordEncriptada;

                        usuarioModel.save((err, usurioGuardado) => {
                            if (err) return res.status(500).send({ mensaje: 'Error al guardar el cliente' })

                            if (usurioGuardado) {
                                return res.status(500).send({ usurioGuardado })

                            } else {
                                return res.status(500).send({ mensaje: 'no se ha podido registrar el cliente' })
                            }
                        })
                    })
                }


            })

    } else {
        return res.status(500).send({ mensaje: 'Agrege todo los parametros para el cliente' })
    }


}

function buscarCategoria(req,res) {
    var idCategoria;
    var params = req.body
    if(req.user.rol != 'cliente'){
        return res.status(500).send({mensaje:'No posee el permiso de buscar los productos por categoria'})
    }

    if(!params.nombre) return res.status(500).send({mensaje:'Agrege los parametros necesarios'})

    Categoria.findOne({nombre:params.nombre}).exec((err,categoriaEncontrada)=>{
        if(err) return res.status(500).send({mensaje:'Error en la peticion'});
        if(!categoriaEncontrada) return res.status(500).send({mensaje:'La categoria que busca no existe'});
        idCategoria = categoriaEncontrada._id

        Producto.find({categoriaProducto: idCategoria}).exec((err,ProductoEncontrado)=>{
            if(err) return res.status(500).send({mensaje:'Error en la peticion'})
            if(!ProductoEncontrado) return res.status(500).send({mensaje:'no hay productos existentes'});
            if(ProductoEncontrado) return res.status(200).send({ProductoEncontrado})
        })
    })
    
}

function nombreProductoB(req, res) {

    var params = req.body

    if (params.nombre) {
        Producto.findOne({ nombre: params.nombre }).exec((err, productoEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
            if (!productoEncontrado) return res.status(500).send({ mensaje: 'El producto que busca no existe' })

            if (productoEncontrado) return res.status(200).send({ productoEncontrado })
        })

    } else {
        return res.status(500).send({ mensaje: 'Llene el parametro de nombre ' })
    }


}

function carrito(req, res) {
    var idCliente = req.user.sub;
    var facturaModel = new Factura()
    var params = req.body;
    var productoNombre;
    var facturaId;
    var productoId;
    var stockP = 0;
    var venta = 0
    var totalStock = 0
    var totalVenta = 0;

    if (req.user.rol != 'cliente') {
        return res.status(500).send({ mensaje: 'No puede comprar un producto' })
    }

    if (params.nombre && params.cantidad) {

        if (params.accion === 'finalizar') {
            Factura.findById(facturaId, (err, facturaEncontrada) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                if (!facturaEncontrada) return res.status(500).send({ mensaje: 'Aun no realiza una compra' })
                facturaId = null;
                return res.status(200).send({facturaEncontrada })
            })

        }

        if (params.accion === 'comprar') {
            Producto.findOne({ nombre: params.nombre }).exec((err, productoEncontrado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                if (!productoEncontrado) return res.status(500).send({ mensaje: 'El producto que busca no existe' })
                productoId = productoEncontrado._id
                productoNombre = productoEncontrado.nombre
                stockP = productoEncontrado.stock
                venta = productoEncontrado.ventas

                if (stockP < params.cantidad) {
                    return res.status(500).send({ mensaje: 'La cantidad que desea es mayor al stock' })
                } else {
                    facturaModel.usuario = idCliente,
                        facturaModel.compras = {
                            compraProducto: productoId,
                            nombre: productoNombre,
                            cantidad: params.cantidad
                        }

                    facturaModel.save((err, facturaGuardada) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                        if (!facturaGuardada) return res.status(500).send({ mensaje: 'Error al guardar la factura' })

                        facturaId = facturaGuardada._id

                        totalStock = stockP - params.cantidad;
                        totalVenta = venta + params.cantidad

                        Producto.update({ _id: productoId }, {
                            $set: {
                                stock: totalStock,
                                ventas: totalVenta
                            }
                        }, { new: true }, (err, productoAtualizado) => {
                            if (err) return res.status(500).send({ mensaje: 'EL producto no se actualizo' });
                            if (!productoAtualizado) return res.status(500).send({ mensaje: 'NO existe el producto xdxdxd' })

                            if (facturaGuardada) return res.status(200).send({ facturaGuardada })
                        })

                    })
                }
            })


        } else if (params.accion === 'agregarCarrito') {
                Producto.findOne({ nombre: params.nombre }).exec((err, productoEncontrado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                    if (!productoEncontrado) return res.status(500).send({ mensaje: 'El producto que busca no existe' })
                    productoId = productoEncontrado._id
                    productoNombre = productoEncontrado.nombre
                    stockP = productoEncontrado.stock
                    venta = productoEncontrado.ventas

                    if (stockP < params.cantidad) {
                        return res.status(500).send({ mensaje: 'La cantidad que desea es mayor al stock' })
                    } 

                    Factura.findByIdAndUpdate(facturaId, {
                        $push: {
                            compras: {
                                compraProducto: productoId,
                                nombre: productoNombre,
                                cantidad: params.cantidad
                            }
                        }
                    }, { new: true }, (err, comprasAgregadas) => {

                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                        if (!comprasAgregadas) return res.status(500).send({ mensaje: 'Accion o)comprar o)finalizar' })
                      
                        totalStock = stockP - params.cantidad;
                        totalVenta = venta + params.cantidad;
                        Producto.update({ _id: productoId }, {
                            $set: {
                                stock: totalStock,
                                ventas: totalVenta
                            }
                        }, { new: true }, (err, productoAtualizado) => {
                            if (err) return res.status(500).send({ mensaje: 'EL producto no fue actualizo' });
                            if (!productoAtualizado) return res.status(500).send({ mensaje: 'No existe el producto' })

                            if (!comprasAgregadas) return res.status(200).send({ comprasAgregadas })

                            return res.status(200).send({ comprasAgregadas })
                        })




                    })
                })
            
        }

    } else {
        return res.status(500).send({ mensaje: 'Llene todos los parametos que faltan' })
    }

}

function masVendidoP(req, res) {

    Producto.find({
        ventas: { $gt: 50 }
    }, {
        _id: 0, stock: 0, categoriaProducto: 0, __v: 0
    }).sort({ ventas: -1 }).limit(100).exec((err, productosMasVendidos) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!productosMasVendidos) return res.status(500).send({ mensaje: 'puede comprar un limite de 50 productos' })
        if (productosMasVendidos) return res.status(200).send({ productosMasVendidos })
    })
}

function editarPerfil(req, res){
    var params = req.body;
    var idCliente = req.params.id;

    delete params.rol;

    if (req.user.sub != idCliente) {
        if (req.user.rol != 'administrador') {
            return res.status(500).send({ mensaje: 'No puede editar el perfil de otro cliente' })
        }
    }

    Usuario.find({ nombre: params.nombre }).exec((err, clienteEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (clienteEncontrado && clienteEncontrado.length >= 1) {
            return res.status(500).send({ mensaje: 'Ya existe ese cliente ingrese otros datos ' })
        } else {
            Usuario.findOne({ _id: idCliente }).exec((err, clienteEncontrado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

                if (!clienteEncontrado) return res.status(500).send({ mensaje: 'No existen los datos' });

                if (clienteEncontrado.rol != 'cliente') return res.status(500).send({ mensaje: 'No posee el permiso para editar este usuario' })
                Usuario.findByIdAndUpdate(idCliente, params, { new: true }, (err, perfilActualizado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

                    if (!perfilActualizado) return res.status(500).send({ mensaje: 'No se ha podido editar el perfil' });

                    if (perfilActualizado) return res.status(200).send({ perfilActualizado })
                })
            })


        }
    })
}

function eliminarPerfil(req, res){
    var idCliente = req.params.id

    if (req.user.rol != 'cliente') {
        return res.status(500).send({ mensaje: 'No posee los permisos para eliminar el perfil' })
    }

    Usuario.findOne({ _id: idCliente }).exec((err, clienteEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!clienteEncontrado) return res.status(500).send({ mensaje: 'No se han encontrado los datos del perfil' })

        Usuario.findByIdAndDelete(idCliente, (err, perfilEliminado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!perfilEliminado) return res.status(500).send({ mensaje: 'No se ha podido eliminar el perfil' });
            if (perfilEliminado) return res.status(200).send({ perfilEliminado})
        })

    })
}

module.exports = {
    iniciarSesion,
    agregarCliente,
    buscarCategoria,
    nombreProductoB,
    masVendidoP,
    carrito,
    editarPerfil,
    eliminarPerfil,
}