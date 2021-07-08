function getAllPostulacionesByEstado(estado){
    

    return new Promise(resolve => {
    
        let l_postulacionesArray = [];
        $SP().list(GuidListPostulacion[0]).get({
            fields:"ID, FK_Tipo_Vehiculo, FK_Edificio",
            where:'Estado = "'+estado+'"' 
        }).then(function(data) {
            for (var i=0; i<data.length; i++){
                
                let postulacion = NewObjectPostulacion();
                postulacion.ID = data[i].getAttribute("ID");
                postulacion.FK_Edificio = splitFunction(data[i].getAttribute("FK_Edificio"), ";#", 0) ;
                postulacion.FK_TipoVehiculo = splitFunction(data[i].getAttribute("FK_Tipo_Vehiculo"), ";#", 0) ;
                
                l_postulacionesArray.push(postulacion);
            }

            resolve(l_postulacionesArray);
                
        });

    });
    
}


function getAllPostulacionesByEdificioyVehiculo(idEdificio, idTipoVehiculo, estado){
    

    return new Promise(resolve => {
    
        let l_postulacionesArray = [];
        let l_where = "Estado = '" + estado +"'";
            
        if(idEdificio != 0)
            l_where = l_where.concat(" AND FK_Edificio = " + idEdificio);
        if(idTipoVehiculo != 0)
            l_where = l_where.concat(" AND FK_Tipo_Vehiculo = " + idTipoVehiculo);
       
        $SP().list(GuidListPostulacion[0]).get({
            where: l_where
        }).then(function(data) {
            for (var i=0; i<data.length; i++){
                
                let postulacion = NewObjectPostulacion();
                postulacion.ID = data[i].getAttribute("ID");
                postulacion.RUT = data[i].getAttribute("RUT");
                postulacion.Email = data[i].getAttribute("Email");
                postulacion.Telefono = data[i].getAttribute("Telefono");
                postulacion.Fecha_Postulacion = data[i].getAttribute("Fecha_Postulacion");
                postulacion.Fecha_Asignacion = data[i].getAttribute("Fecha_Asignacion");
                postulacion.Estado = data[i].getAttribute("Estado");
                postulacion.Posicion_Inicial = splitFunction(data[i].getAttribute("Posicion_Inicial"), ".", 0); 
                postulacion.FK_TipoVehiculo = splitFunction(data[i].getAttribute("FK_Tipo_Vehiculo"), ";#", 0) ;
                postulacion.FK_Edificio = splitFunction(data[i].getAttribute("FK_Edificio"), ";#", 0) ;
                postulacion.Observaciones = data[i].getAttribute("Observaciones");
                postulacion.FK_NombreEdificio = splitFunction(data[i].getAttribute("FK_Edificio_x003a_Nombre"), ";#", 1);
                postulacion.FK_NombreTipoVehiculo = splitFunction(data[i].getAttribute("FK_Tipo_Vehiculo_x003a_Nombre_Ti"), ";#", 1);
                postulacion.Nombre_Solicitante = data[i].getAttribute("Nombre_Solicitante");

                l_postulacionesArray.push(postulacion);
            }

            resolve(l_postulacionesArray);
                
        });

    });
    
}