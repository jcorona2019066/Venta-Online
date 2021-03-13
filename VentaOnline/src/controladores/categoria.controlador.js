'use strict'

var Categoria = require("../modelos/categoria.modelo");
var Producto = require("../modelos/producto.modelo");
var idDefault;

function agregarDefault(req, res) {

    var categoriaModel = new Categoria();

    categoriaModel.nombre = 'Default'

    Categoria.find({ nombre: categoriaModel.nombre }).exec((err, categoriaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (categoriaEncontrada && categoriaEncontrada.length >= 1) {
            return ('La categoria ya existe')
        } else {

            categoriaModel.save((err, categoriaGuardada) => {
                if (err) console.log('Error al guardar la categoria default');
                if (categoriaGuardada) {
                    console.log('Categoria por default esta creada')
                } else {

                    console.log('No se ha podido crear la categoria default')

                }

            })
        }
    })


}

function buscarDefault(req,res) {
    Categoria.findOne({nombre: 'Default'}).exec((err,categoriaEncontrado)=>{
        if(err) return res.status(500).send({mensaje:'Error en la peticion'})
        if(!categoriaEncontrado) console.log(res.status(500).send({mensaje:'El producto que busca no existe'}))
        if(categoriaEncontrado) console.log('categoria default encontrado')
        idDefault = categoriaEncontrado._id;

    })
}

function agregarCategoria(req, res) {
    var categoriaModel = new Categoria();
    var params = req.body;

    agregarDefault();

    if (req.user.rol != 'administrador') {
        return res.status(500).send({ mensaje: 'No posee los permisos para agregar una categoria' })
    }

    if (params.nombre) {

        categoriaModel.nombre = params.nombre

        Categoria.find({ nombre: params.nombre }).exec((err, categoriaEncontrada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
            if (categoriaEncontrada && categoriaEncontrada.length >= 1) {
                return res.status(500).send({ mensaje: 'Ya existe la categoria' })
            } else {

                categoriaModel.save((err, categoriaGuardada) => {
                    if (err) return res.status(500).send({ mensaje: 'Error al guardar la categoria' });
                    if (categoriaGuardada) {
                        return res.status(200).send({ categoriaGuardada })
                    } else {

                        return res.status(500).send({ mensaje: 'No se ha podido guardad la categoria' })

                    }

                })
            }
        })

    } else {
        return res.status(500).send({ mensaje: 'ingrese el nombre de la categoria' })
    }

}

function mostrarCategorias(req, res) {
    Categoria.find().exec((err, Categoria) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!Categoria) return res.status(500).send({ mensaje: 'No existe ninguna categoria' })
        if (Categoria) return res.status(200).send({ Categoria })
    })
}

function editarCategoria(req, res) {
    var idCategoria = req.params.id;
    var params = req.body;

    if (req.user.rol != 'administrador') {
        return res.status(500).send({ mensaje: 'No posee los permisos para editar la categoria' })
    }

    Categoria.find({nombre: params.nombre}).exec((err, categoriaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })


        if (categoriaEncontrada && categoriaEncontrada.length >= 1) {
            return res.status(500).send({ mensaje: 'Ya existe la categoria con ese nombre' })
        } else {
            Categoria.findOne({ _id: idCategoria }).exec((err, categoriaEncontrada) => {
                if (err) return res.status(500).send({ mensaje: 'error en la peticion al obtener la categoria' });
                if (!categoriaEncontrada) return res.status(500).send({ mensaje: 'Error en la peticion editar categoira o no hay datos' });
                if(categoriaEncontrada.nombre === 'Default' ) return res.status(500).send({mensaje:'no tiene permiso para editar esta categoria'})

                Categoria.findByIdAndUpdate(idCategoria, params, { new: true }, (err, categoriaActualizado) => {
                    if (err) return res.status(500).send({ mensaje: 'error en la peticion' });
                    if (!categoriaActualizado) return res.status(500).send({ mensaje: 'no se ha podido editar la categoria' })
                    if (categoriaActualizado) {
                        return res.status(200).send({ categoriaActualizado });
                    }

                })

            })

        }
    })
        

}

function eliminarCategoria(req, res) {
    var idCategoria = req.params.id;
    buscarDefault()

    if(req.user.rol != 'administrador'){
        return res.status(500).send({mensaje: 'No posee el permiso para eliminar categorias'})
    }

    Categoria.findOne({_id: idCategoria}).exec((err,categoriaEncontrada)=>{
        if(err) return res.status(500).send({mensaje:'Error en la peticion'})
        if(!categoriaEncontrada) return res.status(500).send({mensaje:'Los datos no existen'})
        if(categoriaEncontrada.nombre === 'Default') return res.status(500).send({mensaje:'No posee permiso para eliminar la categoria Default'})

        Producto.updateMany({categoriaProducto: idCategoria}, {$set:{categoriaProducto: idDefault }},{multi:true}, (err,productoActualizado)=>{
            if(err) return res.status(500).send({mensaje:'Error al actualizar el producto'})
            if(!productoActualizado) return res.status({mensaje:'No se han encontrado los datos'})
            if(productoActualizado) return res.status(200).send({productoActualizado})
        })

        Categoria.findByIdAndDelete(idCategoria,(err,categoriaEliminada)=>{
            if(err) return res.status(500).send({mensaje:'Error al eliminar la categoira'})
            if(!categoriaEliminada) return res.status(500).send({mensaje:'no tiene datos la categoria'})
            if(categoriaEliminada) return res.status(200).send({mensaje:'La categoria ha sido eliminada'})
        })
    })
    
}

module.exports = {
    agregarCategoria,
    mostrarCategorias,
    editarCategoria,
    eliminarCategoria,
}