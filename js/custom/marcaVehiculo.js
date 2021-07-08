function getComboBoxMarcaVehiculos(selected){
   
        console.log("Tipo Vehiclo: " +selected.val());
        $('#selectMarca').empty();
        
        $SP().list(GuidListMarca[0]).get({
            orderby:"Nombre_Marca ASC",
            where:'FK_Tipo_Vehiculo = "'+selected.val()+'"'
        }).then(function(data) {
            $('#selectMarca').append('<option value="0">Seleccione... </option>');
            for (var i=0; i<data.length; i++){
                $('#selectMarca').append('<option value="'+data[i].getAttribute("ID")+'">'+data[i].getAttribute("Nombre_Marca")+'</option>');
            }
        });

  
}


function getComboBoxMarcaMotos(selected){
   
    console.log("Tipo Vehiclo: " +selected.val());
    $('#selectMoto').empty();
    
    $SP().list(GuidListMarca[0]).get({
        orderby:"Nombre_Marca ASC",
        where:'FK_Tipo_Vehiculo = "'+selected.val()+'"'
    }).then(function(data) {
        $('#selectMoto').append('<option value="0">Seleccione... </option>');
        for (var i=0; i<data.length; i++){
            $('#selectMoto').append('<option value="'+data[i].getAttribute("ID")+'">'+data[i].getAttribute("Nombre_Marca")+'</option>');
        }
    });


}


function getComboBoxMarcaBicicletas(selected){
   
    console.log("Tipo Vehiclo: " +selected.val());
    $('#selectBicicleta').empty();
    
    $SP().list(GuidListMarca[0]).get({
        orderby:"Nombre_Marca ASC",
        where:'FK_Tipo_Vehiculo = "'+selected.val()+'"'
    }).then(function(data) {
        $('#selectBicicleta').append('<option value="0">Seleccione... </option>');
        for (var i=0; i<data.length; i++){
            $('#selectBicicleta').append('<option value="'+data[i].getAttribute("ID")+'">'+data[i].getAttribute("Nombre_Marca")+'</option>');
        }
    });


}
