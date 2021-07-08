$(document).ready(function() {
    //SetUser();
    getRadioButtomEdificios();
    getCheckBoxTipoVehiculo();
    //getComboBoxTipoVehiculo();
    //getComboBoxMarcaVehiculos();
    //getComboBoxModeloVehiculo();
    
});

/* Funcion que registra solicitud de estacionamiento */
function agregar2(){
    var v_Postulacion = NewObjectPostulacion2();
    var v_newVehiculo = NewObjectVehiculo();
    /*
    var v_idMarca = $("#selectMarca option:selected").text();
    var v_IdModelo = $("#selectModelo option:selected").text(); 
    var v_Patente = $('#patente').val();
    var v_tipoVehiculo = $('#selectTipoVehiculo').val();
    */
    if(validate()){

        
        v_newVehiculo.Patente = $('#patente').val();
        v_newVehiculo.Marca = $("#selectMarca option:selected").text();
        v_newVehiculo.Modelo = $("#selectModelo option:selected").text();;
        v_newVehiculo.FK_Tipo_Vehiculo = $('#selectTipoVehiculo').val();

        //Almacenando Vehiculo
        //$SP().list(GuidListVehiculo[0]).add(v_newVehiculo).then(function(items) {
        $SP().list(GuidListVehiculo[0]).add({
            Patente: v_newVehiculo.Patente,
            Marca:v_newVehiculo.Marca,
            Modelo:v_newVehiculo.Modelo,
            FK_Tipo_Vehiculo: v_newVehiculo.FK_Tipo_Vehiculo,
            }).then(function(items) {   
            if (items.failed.length > 0) {
                for (let i=0; i < items.failed.length; i++) 
                    console.log("Error '"+items.failed[i].errorMessage+"' with:"+items.failed[i].Patente); // the 'errorMessage' attribute is added to the object
            }
            if (items.passed.length > 0) {
                for (let i=0; i < items.passed.length; i++){
                    
                    //Asociando ID registro a vehiculo
                    v_newVehiculo.ID = items.passed[i].ID;
                    
                    //Setiando Objeto Postulacion
                    v_Postulacion.RUT = $('#rut').val();
                    v_Postulacion.FK_Vehiculo = v_newVehiculo.ID;
                    v_Postulacion.FK_Edificio = $('#selectEdificio').val();

                    console.log(v_Postulacion);

                    //Almacenando Postulacion
                    $SP().list(GuidListPostulacion2[0]).add({
                            RUT: v_Postulacion.RUT,
                            FK_Vehiculo: v_Postulacion.FK_Vehiculo,
                            FK_Edificio: v_Postulacion.FK_Edificio
                        }).then(function(items) {   
                        if (items.failed.length > 0) {
                            for (let i=0; i < items.failed.length; i++) 
                                console.log("Error '"+items.failed[i].errorMessage+"' with:"+items.failed[i].Patente); // the 'errorMessage' attribute is added to the object
                        }
                        if (items.passed.length > 0) {
                            for (let i=0; i < items.passed.length; i++){
                                console.log("Success for:"+items.passed[i].Patente+" (ID:"+items.passed[i].ID+")");
                                $("#idLabel").text(items.passed[i].ID);
                                $("#miModal").modal("show");
                            } 
                            
                        }
                    });

                    //console.log("Success for:"+items.passed[i].Patente+" (ID:"+items.passed[i].ID+")");
                } 
                
            }
        });

        
    }
}

/* Funcion que registra solicitud de estacionamiento */
function agregar(){
    
        var map = new Map();

        let l_rut = $('#rut').val();
        let l_edificio = $('input:radio[name=radEdificio]:checked').val();
        var msgModal = '';

        let l_cantidadCheckSelected = $("input[name='chkTipoVehiculo']:checked").length;
        let l_contadorInserts = 0;
        let l_totalRegistros = 0;

        $("input[name='chkTipoVehiculo']:checked").each(function(){

            let l_tipoVehiculoID = this.value;
            let l_tipoVehiculoName = $('#lblEdificio'+this.value).text();
            
            map.set(l_tipoVehiculoID, l_tipoVehiculoName);

            let l_tipoVehiculo = this.value;
            map.set(l_tipoVehiculo, l_tipoVehiculoName);
 
            //Consultando si posee registros activos.
            $SP().list(GuidListPostulacion[0]).get({
                fields:"ID",
                where:'RUT = "'+l_rut+'" AND Fecha_Postulacion <> null AND FK_Tipo_Vehiculo = '+l_tipoVehiculoID
              }).then(function(row) {
                
                l_totalRegistros = row.length;
                l_contadorInserts++;
                console.log("total registros de " + map.get(l_tipoVehiculoID) + " son: " +l_totalRegistros );
                

                if(l_totalRegistros == 0){

                    //Almacenando Postulacion
                    $SP().list(GuidListPostulacion[0]).add({
                        RUT: l_rut,
                        FK_Tipo_Vehiculo: l_tipoVehiculoID,
                        FK_Edificio: l_edificio
                    }).then(function(items) {   
                        if (items.failed.length > 0) {
                            for (let i=0; i < items.failed.length; i++) 
                                console.log("Error al almacenar solicitud: '"+items.failed[i].errorMessage+"'  para tipo vehiculo :"+ l_tipoVehiculoID); // the 'errorMessage' attribute is added to the object
                        }
                        if (items.passed.length > 0) {
                            for (let i=0; i < items.passed.length; i++){
                                msgModal = msgModal + "<div class='pt-2'>" +
                                                    "Tu posicionamiento en la cola a la espera de asignanci&oacute;n de estacionamiento de " +map.get(l_tipoVehiculoID)+" es: " +
                                                    "<span class='posicion'>" +items.passed[i].ID+"</span>"
                                                    +"</div>";
                            } 
        
                        }

                        if(l_cantidadCheckSelected === l_contadorInserts){
                            $("#divModal").html(msgModal);
                            $("#miModal").modal("show");
                        }
                    });

                }
                else{
                    msgModal = msgModal + "<div class='pt-2'>" +
                                        "Ya posee solicitud de asignanci&oacute;n de estacionamiento de " +map.get(l_tipoVehiculoID)+"."
                                        +"</div>";


                    if(l_cantidadCheckSelected === l_contadorInserts){
                        $("#divModal").html(msgModal);
                        $("#miModal").modal("show");
                    }
                }

              });

              //Almacenando Postulacion

              console.log("msgModal" + msgModal );
        });;

        
        /*$("#divModal").html($("#divModal").html() + msgModal);
        $("#miModal").modal("show");*/
       
}

//funcion que valida formulario
function validate(){

    let telefono = $('#telefono').val();
    if(telefono != null && telefono.length != 9)    {
        $('#divErrorTelefono').show();
        return false;
    }
    else
        $('#divErrorTelefono').hide();

    return true;
}


//Validando solo digitos en telefono
$(function(){

    $('#telefono').keypress(function(e) {
        if(event.charCode >= 48 && event.charCode <= 57 ){
            return true;
        }
        return false;   
    })
     
});



$(function () {
    $("#chkTerminnosCondiciones").click(function () {
        if ($(this).is(":checked")) {
            $('#butRegistrar').attr("disabled", false);
            $( "#div1" ).hide()
            $( "#div2" ).show()
            
        } else {
            $('#butRegistrar').attr("disabled", true);  
            $( "#div1" ).show()
            $( "#div2" ).hide()   
        }
    });
});