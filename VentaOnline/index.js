const mongoose = require("mongoose");
const app = require("./app");
var Admin = require("./src/controladores/usuario.controlador")

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/dbVentaOnline', {useNewUrlParser: true, useUnifiedTopology:true}).then(()=>{

    console.log('Se encuentra conectado a la base de datos');

    Admin.crearAdmin();
    console.log("Se creo Admin");

    app.listen(3000,function(){

        console.log('El servidor esta funcionando en el puerto 3000')
    })    

}).catch(err => console.log(err));