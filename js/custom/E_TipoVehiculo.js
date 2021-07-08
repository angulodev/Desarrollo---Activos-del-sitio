/* Funcion que añade a formulario checkbox de tipo de vehiculos */
function getCheckBoxTipoVehiculo(){
    $SP().list(GuidListTipoVehiculo[0]).get({
        where:"Activo = 1",
        orderby:"Nombre_Tipo ASC"
    }).then(function(data) {

        var row ="";
        for (var i=0; i<data.length; i++){
            
            row = row +
            "<div class='form-check-inline'>" +
                "<label class='form-check-label text-form' for='chk"+data[i].getAttribute("Nombre_Tipo")+"' id='lblTipoVehiculo"+data[i].getAttribute("ID")+"' >" +
                    "<input type='checkbox' class='form-check-input' name='chkTipoVehiculo' id='chk"+data[i].getAttribute("Nombre_Tipo")+"' value='"+data[i].getAttribute("ID")+"'>" +data[i].getAttribute("Nombre_Tipo") +
                "</label>" +
            "</div>";
        }

        $("#divCheckTipoVehiculos").html($("#divCheckTipoVehiculos").html() + row);

    });
}








/* Funcion que añade a formulario checkbox de tipo de vehiculos */
function getCheckBoxTipoVehiculoListarPostulaciones(){
    $SP().list(GuidListTipoVehiculo[0]).get({
        where:"Activo = 1",
        orderby:"Nombre_Tipo ASC"
    }).then(function(data) {

        var row ="";
        for (var i=0; i<data.length; i++){
            
            row = row +
            "<div class='form-check-inline'>" +
                "<label class='form-check-label text-form' for='chk"+data[i].getAttribute("Nombre_Tipo")+"' id='lblTipoVehiculo"+data[i].getAttribute("ID")+"' >" +
                    "<input type='checkbox' class='form-check-input' name='chkTipoVehiculo' id='chk"+data[i].getAttribute("Nombre_Tipo")+"' value='"+data[i].getAttribute("ID")+"'>" +data[i].getAttribute("Nombre_Tipo") +
                "</label>" +
            "</div>";
        }

        $("#divCheckTipoVehiculos").html($("#divCheckTipoVehiculos").html() + row);



        //Evento que escucha los cambios en los checkbox de tipo vehiculos
        $(function(){
            $("input[name='chkTipoVehiculo']").change(function () {
                
                mostrarLoadingDosPadres("loadingTable");
                $("input[name='chkTipoVehiculo']").not(this).prop('checked', false);
                
                if($(this).prop('checked')) 
                    preparaLLamadoPrintTable($(this).val());
                else
                    preparaLLamadoPrintTable(0);
            });


        });
    });

}

