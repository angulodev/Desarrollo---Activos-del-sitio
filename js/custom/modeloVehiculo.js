function getComboBoxModeloVehiculo(selected){
   
        $('#selectModelo').empty();

        $SP().list(GuidListModelo[0]).get({
            orderby:"Nombre_Marca ASC",
            where:'FK_Marca = "'+selected.val()+'"'
        }).then(function(data) {
            $('#selectModelo').append('<option value="0">Seleccione... </option>');
            for (var i=0; i<data.length; i++){
                $('#selectModelo').append('<option value="'+data[i].getAttribute("ID")+'">'+data[i].getAttribute("Nombre_Modelo")+'</option>');
            }
        });
}

function getComboBoxModeloMoto(selected){
   
    $('#selectModeloMoto').empty();

    $SP().list(GuidListModelo[0]).get({
        orderby:"Nombre_Marca ASC",
        where:'FK_Marca = "'+selected.val()+'"'
    }).then(function(data) {
        $('#selectModeloMoto').append('<option value="0">Seleccione... </option>');
        for (var i=0; i<data.length; i++){
            $('#selectModeloMoto').append('<option value="'+data[i].getAttribute("ID")+'">'+data[i].getAttribute("Nombre_Modelo")+'</option>');
        }
    });
}


function getComboBoxModeloBicicleta(selected){
   
    $('#selectModeloBicileta').empty();

    $SP().list(GuidListModelo[0]).get({
        orderby:"Nombre_Marca ASC",
        where:'FK_Marca = "'+selected.val()+'"'
    }).then(function(data) {
        $('#selectModeloBicileta').append('<option value="0">Seleccione... </option>');
        for (var i=0; i<data.length; i++){
            $('#selectModeloBicileta').append('<option value="'+data[i].getAttribute("ID")+'">'+data[i].getAttribute("Nombre_Modelo")+'</option>');
        }
    });
}

