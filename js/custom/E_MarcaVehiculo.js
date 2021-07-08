function getComboBoxMarcaVehiculosVisita(){
    
    $('#selectMarca').empty();
    
    $SP().list(GuidListMarca[0]).get({
        orderby:"Nombre_Marca ASC",
        where:'FK_Tipo_Vehiculo = 1'
    }).then(function(data) {
        $('#selectMarca').append('<option value="0">Seleccione... </option>');
        for (var i=0; i<data.length; i++){
            $('#selectMarca').append('<option value="'+data[i].getAttribute("ID")+'">'+data[i].getAttribute("Nombre_Marca")+'</option>');
        }
    });


}



function getComboBoxMarcaVehiculosAsociarVehiculo(idTipoVehiculo){
    
    var row ="";
    return new Promise(resolve => {

            $SP().list(GuidListMarca[0]).get({
                orderby:"Nombre_Marca ASC",
                where:'FK_Tipo_Vehiculo = ' + idTipoVehiculo
            }).then(function(data) {
                row += '<option value="0">Seleccione... </option>';
                for (var i=0; i<data.length; i++){
                    row += '<option value="'+data[i].getAttribute("ID")+'">'+data[i].getAttribute("Nombre_Marca")+'</option>';
                }

                $("#selectMarca1").append(row);
                $("#selectMarca2").append(row);
                $("#selectMarca3").append(row);
                $("#selectMarca4").append(row);
                $("#selectMarca5").append(row);

                resolve(true);
            });
            
            
    });
    


}