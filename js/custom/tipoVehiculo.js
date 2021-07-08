/* Funcion que añade a formulario combobox de tipo de vehiculos */
function getComboBoxTipoVehiculo(){
    $SP().list(GuidListTipoVehiculo[0]).get({
        orderby:"Nombre_Tipo ASC",
        //where:'Clase <> "'+name+'"'
    }).then(function(data) {
        
        var row = "<label for='selectTipoVehiculo'>Tipo Veh&iacute;culo</label>" + 
                  "<select class='form-control' id='selectTipoVehiculo'>" + 
                  "<option value='0' selected>Seleccione...</option>";
        for (var i=0; i<data.length; i++){
            row = row + "<option value="+data[i].getAttribute("ID")+" >"+data[i].getAttribute("Nombre_Tipo")+"</option>";
        }
        row = row + "</select>";
        
        $("#divSelectTipoVehiculo").html($("#divSelectTipoVehiculo").html() + row);



        //Select tipo vehiculo despliega form patente vechiculo
        $(function(){

            $('#selectTipoVehiculo').change(function() {
                console.log('value: ' +$(this).val());
                if($(this).val() != 0 && $(this).val() != 3){ 
                    getComboBoxMarcaVehiculos();
                    $("#divFormDatosVehiculo").show();
                }
                else{
                    $("#divFormDatosVehiculo").hide();
                }
            });
        });

    });
}


/* Funcion que añade a formulario checkbox de tipo de vehiculos */
function getCheckBoxTipoVehiculo(){
    $SP().list(GuidListTipoVehiculo[0]).get({
        orderby:"Nombre_Tipo ASC",
        //where:'Clase <> "'+name+'"'
    }).then(function(data) {

        var row ="";
        for (var i=0; i<data.length; i++){
            row = row + 
            "<div class='custom-control custom-checkbox custom-control-inline textoRadioCheck'>" + 
            "<input type='checkbox' class='custom-control-input'   name='chkTipoVehiculo' id='chk"+data[i].getAttribute("ID")+"' value='"+data[i].getAttribute("ID")+"'>" + 
            "<label class='custom-control-label' for='chk"+data[i].getAttribute("ID")+"' >"+data[i].getAttribute("Nombre_Tipo")+"</label>" + 
            "</div>";
        }

        $("#divCheckTipoVehiculos").html($("#divCheckTipoVehiculos").html() + row);

    });
}



/* Funcion que añade a formulario checkbox de tipo de vehiculos */
function getCheckBoxTipoVehiculoVisita(){
    $SP().list(GuidListTipoVehiculo[0]).get({
        orderby:"Nombre_Tipo ASC",
        //where:'Clase <> "'+name+'"'
    }).then(function(data) {

        var row ="";
        for (var i=0; i<data.length; i++){
            row = row + 
                  "<div class='custom-control custom-checkbox custom-control-inline textoRadioCheck'>" + 
                    "<input type='checkbox' class='custom-control-input'   name='chkTipoVehiculo' id='chk"+data[i].getAttribute("ID")+"' value='"+data[i].getAttribute("ID")+"'>" + 
                    "<label class='custom-control-label' for='chk"+data[i].getAttribute("ID")+"' >"+data[i].getAttribute("Nombre_Tipo")+"</label>" + 
                  "</div>";
        }

        $("#divCheckTipoVehiculos").html($("#divCheckTipoVehiculos").html() + row);

        
        //Evento que escucha los cambios en los checkbox de tipo vehiculos
        $(function(){
            $("input[name='chkTipoVehiculo']").change(function () {
                if($(this).prop('checked')) {

                    if($(this).val() == 1){
                        getComboBoxMarcaVehiculos($(this));
                        $( "#divFormDatosAutomovil" ).show();
                    }
                    if($(this).val() == 2){
                        getComboBoxMarcaMotos($(this));
                        $( "#divFormDatosMoto" ).show();
                    }
                    if($(this).val() == 3){
                        getComboBoxMarcaBicicletas($(this));
                        $( "#divFormDatosBicicleta" ).show();
                    }
                } else {
                    if($(this).val() == 1)
                        $( "#divFormDatosAutomovil" ).hide();
                    if($(this).val() == 2)
                        $( "#divFormDatosMoto" ).hide();
                    if($(this).val() == 3)
                        $( "#divFormDatosBicicleta" ).hide();
                }
            });
        });

    });
}



