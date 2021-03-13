'use strict'

var Usuario = require('../modelos/usuario.modelo');
var bcrypt = require('bcrypt-nodejs');


function crearAdmin(req, res) {
    var adminModel = new Usuario();

    adminModel.nombre = "ADMIN";
    adminModel.apellido = "Corona"
    adminModel.email = "admin@gmail"
    adminModel.password = "123456";
    adminModel.rol = "administrador"

    Usuario.find({

        $or: [
            { nombre: adminModel.nombre }
        ]

    }).exec((err, adminEncontrado) => {
        if (err) return console.log('Error al crear el Admin');
        if (adminEncontrado.length >= 1) {
            return console.log("El admin ya existe")
        } else {
            bcrypt.hash('123456', null, null, (err, passwordEncriptada) => {
                adminModel.password = passwordEncriptada;
                adminModel.save((err, adminGuardado) => {
                    if (err) return console.log('error en la peticion del Admin')
                    if (adminGuardado) {
                        console.log('Admin Creado ')
                    } else {
                        console.log('Error al crear el Admin')
                    }
                })
            })
        }
    })
}

function agregarUsuario(req, res) {
    var usuarioModel = new Usuario();
    var params = req.body;

    if (req.user.rol != 'administrador') {
        return res.status(500).send({ mensaje: 'No posee los permisos para agregar un Usuario' })
    }

    if (params.nombre && params.password) {

        usuarioModel.nombre = params.nombre,
        usuarioModel.apellido = params.apellido,
        usuarioModel.email = params.email,
        usuarioModel.rol = params.rol,
            Usuario.find({
                $or: [
                    {nombre: params.nombre },
                    {password: params.password}
                ]
            }).exec((err, UsuarioEncontrado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

                if (UsuarioEncontrado && UsuarioEncontrado.length >= 1) {
                    return res.status(500).send({ mensaje: 'El usuario ya existe' })
                } else {
                    bcrypt.hash(params.password, null, null, (err, passwordEncriptada) => {
                        usuarioModel.password = passwordEncriptada;

                        usuarioModel.save((err, usurioGuardado) => {
                            if (err) return res.status(500).send({ mensaje: 'Error al guardar el usuario' })

                            if (usurioGuardado) {
                                return res.status(500).send({ usurioGuardado })

                            } else {
                                return res.status(500).send({ mensaje: 'no se ha podido registrar el usuario' })
                            }
                        })
                    })
                }


            })

    } else {
        return res.status(500).send({ mensaje: 'Agrege todo los parametros' })
    }


}

function editarUsuario(req, res) {
    var params = req.body;
    var idUsuario = req.params.id;

    delete params.password;
    delete params.rol;

    if (req.user.sub != idUsuario) {
        if (req.user.rol != 'administrador') {
            return res.status(500).send({ mensaje: 'No posee los permisos para editar un usuario' })
        }
    }

    Usuario.find({ nombre: params.nombre }).exec((err, UsuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (UsuarioEncontrado && UsuarioEncontrado.length >= 1) {
            return res.status(500).send({ mensaje: 'El nombre al que desea modificar ya existe ' })
        } else {
            Usuario.findOne({ _id: idUsuario }).exec((err, usuarioEncontrado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

                if (!usuarioEncontrado) return res.status(500).send({ mensaje: 'No existen los datos' });

                if (usuarioEncontrado.rol != 'cliente') return res.status(500).send({ mensaje: 'No posee el permiso para editar este usuario' })
                Usuario.findByIdAndUpdate(idUsuario, params, { new: true }, (err, usuarioActualizado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

                    if (!usuarioActualizado) return res.status(500).send({ mensaje: 'No se ha podido editar el usuario' });

                    if (usuarioActualizado) return res.status(200).send({ usuarioActualizado })
                })
            })


        }
    })
}

function eliminarUsuario(req, res) {
    var idUsuario = req.params.id

    if (req.user.rol != 'administrador') {
        return res.status(500).send({ mensaje: 'No posee los permisos para eliminar un usuario' })
    }

    Usuario.findOne({ _id: idUsuario }).exec((err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!usuarioEncontrado) return res.status(500).send({ mensaje: 'No se han encontrado los datos' })

        if (usuarioEncontrado.rol != 'cliente') return res.status(500).send({ mensaje: 'No puede eliminar a un usuario administrador' });

        Usuario.findByIdAndDelete(idUsuario, (err, usuarioEliminado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!usuarioEliminado) return res.status(500).send({ mensaje: 'No se ha podido eliminar el usuario' });
            if (usuarioEliminado) return res.status(200).send({ usuarioEliminado})
        })

    })


}

function cambiarRol(req, res) {
    var params = req.body;
    var idUsuario = req.params.id

    delete params.password;
    delete params.nombre;
    delete params.apellido;
    delete params.email;

    if (req.user.rol != 'administrador') {
        return res.status(500).send({ mensaje: 'No posee los permisos para cambiar rol' })
    }

    Usuario.findByIdAndUpdate(idUsuario, params, { new: true }, (err, empleadoActualizado) => {
        if (err) return res.status(500).send({ mensaje: 'error en la peticion' });

        if (!empleadoActualizado) return res.status(500).send({ mensaje: 'no se ha podido cambiar rol' })
        if (empleadoActualizado) {
            return res.status(200).send({ empleadoActualizado });
        }

    })


}


module.exports = {
    crearAdmin,
    agregarUsuario,
    cambiarRol,
    editarUsuario,
    eliminarUsuario,
}