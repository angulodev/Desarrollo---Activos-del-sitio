async function getEstacionamientoByID (idEstacionamiento) {

            return new Promise(resolve => {

                
                        $SP().list(GuidListEstacionamiento[0]).get({
                            where:'ID = ' + idEstacionamiento
                        }).then(function(items) {   
                            
                            

                            if(items.length == 0)
                                resolve(null); 

                            for (let i=0; i < items.length; i++){

                                var v_estacionamiento = NewObjectEstacionamiento();
                                v_estacionamiento.ID = items[i].getAttribute("ID");
                                v_estacionamiento.Piso = splitFunction(items[i].getAttribute("Piso"), ".", 0) ; 
                                v_estacionamiento.Numero = splitFunction(items[i].getAttribute("Numero"), ".", 0) ; 
                                v_estacionamiento.Costo = items[i].getAttribute("Costo");
                                v_estacionamiento.FK_Edificio = splitFunction(items[i].getAttribute("FK_Edificio"), ";#", 0) ;
                                v_estacionamiento.FK_Tipo_Vehiculo = splitFunction(items[i].getAttribute("FK_Tipo_Vehiculo"), ";#", 0) ;
                                v_estacionamiento.FK_CategoriaEstacionamiento = splitFunction(items[i].getAttribute("FK_CategoriaEstacionamiento"), ";#", 0) ;
                            }

                            resolve(v_estacionamiento);
                        });
                
            });
   
}





/*
var estacionamiento = {
        ID : 0,
        Piso : '',
        Numero : '',
        Costo : '',
        FK_Edificio:0,
        FK_Tipo_Vehiculo:0,
        FK_CategoriaEstacionamiento:0,
        ObjProperty : {
            ID : 'int',
            Piso : 'string',
            Numero : 'string',
            Costo : 'string',
            FK_Edificio: 'int',
            FK_Tipo_Vehiculo: 'int',
            FK_CategoriaEstacionamiento: 'int'
            
		}
*/