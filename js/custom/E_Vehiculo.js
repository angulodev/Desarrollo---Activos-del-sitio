async function addVehiculo (v_vehiculo) {

            return new Promise(resolve => {

                
                        $SP().list(GuidListVehiculo[0]).add({
                            Patente: v_vehiculo.Patente,
                            FK_Tipo_Vehiculo : v_vehiculo.FK_Tipo_Vehiculo,
                            FK_MarcaVehiculo: v_vehiculo.FK_MarcaVehiculo,
                            FK_UsuarioEstacionamiento : v_vehiculo.FK_UsuarioEstacionamiento
                        }).then(function(items) {   
                            
                            if (items.failed.length > 0) {
                                for (let i=0; i < items.failed.length; i++) 
                                    console.log("Error al almacenar solicitud: '"+items.failed[i].errorMessage+"'  para tipo vehiculo :"+ l_tipoVehiculoID); // the 'errorMessage' attribute is added to the object
                                    $( "#loadingGeneral").hide();
                            }

                            
                            for (let i=0; i < items.passed.length; i++){
                                v_vehiculo.ID = items.passed[i].ID;
                            }

                            resolve(v_vehiculo);
                        });
                
            });
   
}

function getVehiculosByIdUsuarioEstacionamiento(IdUsuarioEstacionamiento){
    

    return new Promise(resolve => {
        
        let l_vehiculoArray = [];
          
        $SP().list(GuidListVehiculo[0]).get({
            where:"FK_UsuarioEstacionamiento = " + IdUsuarioEstacionamiento
        }).then(function(data) {

            if(data.length == 0)
                resolve(l_vehiculoArray);
                
            for (var i=0; i<data.length; i++){
                
                var vehiculo = NewObjectVehiculo();

                vehiculo.ID = data[i].getAttribute("ID")
                vehiculo.Patente = data[i].getAttribute("Patente") ; 
                vehiculo.FK_Tipo_Vehiculo = splitFunction(data[i].getAttribute("FK_Tipo_Vehiculo"), ";#", 0) ;
                vehiculo.FK_MarcaVehiculo = splitFunction(data[i].getAttribute("FK_MarcaVehiculo"), ";#", 0) ;
                vehiculo.FK_UsuarioEstacionamiento = splitFunction(data[i].getAttribute("FK_UsuarioEstacionamiento"), ";#", 0) ;

                l_vehiculoArray.push(vehiculo);
            
            }

            resolve(l_vehiculoArray);
        });

    });
}

async function deleteVehiculoById (v_idVehiculo) {

    return new Promise(resolve => {

        
        $SP().list(GuidListVehiculo[0]).remove({
            where:"ID = " + v_idVehiculo ,
            progress:function(current,max) {
                console.log(current+"/"+max);
                resolve(true);
          }});
        
    });

}



async function deleteVehiculoByIdUsuarioEstacionamiento(v_idUsuarioEstacionamiento) {

    return new Promise(resolve => {

        
        $SP().list(GuidListVehiculo[0]).remove({
            where:"FK_UsuarioEstacionamiento = " + v_idUsuarioEstacionamiento ,
            progress:function(current,max) {
                console.log(current+"/"+max);
                resolve(true);
          }});
        
    });

}



/*
function NewObjectVehiculo(){
	var vehiculo = {
		ID : 0,
		Patente: '',
		FK_Tipo_Vehiculo: '',
		FK_MarcaVehiculo:0,
		FK_UsuarioEstacionamiento:0,
		ObjProperty : {
			ID : 'int',
			Patente : 'string',
			FK_Tipo_Vehiculo: 'int',
			FK_MarcaVehiculo:'int',
			FK_UsuarioEstacionamiento:'int'
		}
	};
	return vehiculo;
}
*/