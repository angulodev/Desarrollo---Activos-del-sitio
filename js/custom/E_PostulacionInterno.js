$(document).ready(function() {
    sessionStorage.clear();
    getRadioButtomEdificios();
    getCheckBoxTipoVehiculo();
    GetDatosAntecedentes();
    
    //createImage();
});



/*
function createImage(){
    

    html2canvas($('#divAntecedentes').get(0)).then( function (canvas) {
            // canvas is the final rendered <canvas> element
            console.log('Entro');
            var myImage = canvas.toDataURL("image/png");
            console.log('data: ' +myImage);
            document.body.appendChild(myImage);
            //window.open(myImage);
        }
    );
}
*/

function agregarSolicitud(mapTipoVehiculoGuardar, mapContadorInicial, mapTipoVehiculos){

    let l_rut = $('#antecedenteRUT').val().replace(/[.]/g,"");
    let l_telefono = $('#antecedenteNumero').val();
    let l_correo = $('#antecedenteCorreo').val();
    let l_edificio = $('input:radio[name=radEdificio]:checked').val();
    let l_edificioName = $('#lblTipoEdificio'+l_edificio).text();
    let l_cantidadCheckSelected = $("input[name='chkTipoVehiculo']:checked").length;
    let l_contadorInserts = 0;
    let l_nombreUsuario = $("#antecedenteNombre").text();


    let edificio = NewObjectEdificio();
    edificio.Nombre = l_edificioName;
    edificio.ID= l_edificio;

    sessionStorage.setItem("edificioPostulacion", JSON.stringify(edificio));

    //recorriendo los tipos de vehiculos seleccionados para postular
    $("input[name='chkTipoVehiculo']:checked").each(function(){

        //Obteniendo ID y nombre del tipo de vehiculo seleccionado para setearlo en el map.
        let l_tipoVehiculoID = this.value;

        l_contadorInserts++;

        if(mapTipoVehiculoGuardar.get(l_tipoVehiculoID) =="SI")
        {    //Almacenando Postulacion
            $SP().list(GuidListPostulacion[0]).add({
                RUT: l_rut,
                FK_Tipo_Vehiculo: l_tipoVehiculoID,
                FK_Edificio: l_edificio,
                Email: l_correo, 
                Telefono: l_telefono,
                Posicion_Inicial: mapContadorInicial.get(l_tipoVehiculoID),
                Nombre_Solicitante: l_nombreUsuario

            }).then(function(items) {   
                if (items.failed.length > 0) {
                    for (let i=0; i < items.failed.length; i++) 
                        console.log("Error al almacenar solicitud: '"+items.failed[i].errorMessage+"'  para tipo vehiculo :"+ l_tipoVehiculoID); // the 'errorMessage' attribute is added to the object
                        $( "#loadingGeneral").hide();
                }
                /*
                if (items.passed.length > 0) {
                    for (let i=0; i < items.passed.length; i++){
                        msgModal = msgModal + "<div class='pt-2'>" +
                                            "Tu posicionamiento en la cola a la espera de asignanci&oacute;n de estacionamiento de " +map.get(l_tipoVehiculoID)+" es: " +
                                            "<span class='posicion'>" +items.passed[i].ID+"</span>"
                                            +"</div>";
                    } 

                }*/

                if(l_cantidadCheckSelected === l_contadorInserts)
                        location.href='fichaResumenPostular.aspx';
                
            });
        }
                


    }); //for check
   
}


function validaFormulario(){

    //createImage();
    $( "#loadingGeneral").show();

    let l_edificio = $('input:radio[name=radEdificio]:checked').val();
    let l_cantidadCheckSelected = $("input[name='chkTipoVehiculo']:checked").length;
    let l_telefono = $('#antecedenteNumero').val();
    let l_rut = $('#antecedenteRUT').val().replace(/[.]/g,"");
    
    //Validacion datos usuario en api
    if(l_rut == ""){
        $("#msjModal").html("Estimado usuario, usted no existe registrado en nuestros sistemas. Contactese con un administrador.");
        $("#Modal-ups").modal("show");
        $( "#loadingGeneral").hide();
        return false;
    }
    
    //validacion formato telefono
    if(l_telefono != null && l_telefono.length != 9)    {
        $('#divErrorTelefono').show();
        $( "#loadingGeneral").hide();
        return false;
    }
    else
        $('#divErrorTelefono').hide();


    //validacion seleccion edificio
    if(l_edificio == undefined){
        $("#msjModal").html("Estimado usuario, debe seleccionar el edificio al cual quiere postular.");
        $("#Modal-ups").modal("show");
        $( "#loadingGeneral").hide();
        return false;
    }
        
    //validacion seleccion tipo vehiculo
    if(l_cantidadCheckSelected === 0){
        $("#msjModal").html("Estimado usuario, debe seleccionar para que tipo de vehículo necesita estacionamiento.");
        $("#Modal-ups").modal("show");
        $( "#loadingGeneral").hide();
        return false;
    }
        
    validaPosesionEstacionamiento(l_rut);
    
}


/* Validacion estacionamiento asignado*/
function validaPosesionEstacionamiento(l_rut){
    let respuesta = false;
    $SP().list(GuidListUsuarioEstacionamiento[0]).get({
        fields:"ID",
        where:'RUT = "'+l_rut+'"'
    }).then(function(row) {
            l_total = row.length;
            if(l_total != 0){
                $("#msjModal").html("Estimado usuario, usted ya posee un estacionamiento asignado.");
                $("#Modal-ups").modal("show");
                $( "#loadingGeneral").hide();
                return false;
            }
            //Validacion si posee postulacion pendiente
            else
                validaPostulacionMismoEdifico(l_rut);


    });
}

/* Validacion postulacion existente en el mismo edificio*/
function validaPostulacionMismoEdifico(l_rut){
  
    let l_edificio = $('input:radio[name=radEdificio]:checked').val();
    
    //Consultando si posee registros activos.
    $SP().list(GuidListPostulacion[0]).get({
        fields:"FK_Edificio",
        where:'RUT = "'+l_rut+'" AND Estado = "Pendiente" AND FK_Edificio <> ' + l_edificio,
        groupby: 'FK_Edificio'
    }).then(function(row) {
        
        var v_idEdificio = 0;
        for (var i=0; i<row.length; i++){
            v_idEdificio = splitFunction(row[i].getAttribute("FK_Edificio"), '#', 0);
        }    
        
        if(row.length == 0)
            validaPostulacionExistente(l_rut);
        else 
            getNameByIDForPostulacionInterno(v_idEdificio);
            
            
    });


}


/* Validacion postulacion existente por edificio y tipo vehiculo*/
function validaPostulacionExistente(l_rut){
    
    //map para guardar tipos de vehiculo y su id (desde checkbox)
    var mapTipoVehiculo = new Map();
    //map para guardar si el tipo de solicitud se almacena o no
    var mapGuarda = new Map();
    
    let l_cantidadCheckSelected = $("input[name='chkTipoVehiculo']:checked").length;
    let l_contadorEvaluados = 0;
    let l_totalRegistros = 0;

    let l_edificio = $('input:radio[name=radEdificio]:checked').val();
    let l_flagPoseeSolicitudesPendientes = false;
    let msgModal = '';

    //recorriendo los tipos de vehiculos seleccionados para postular
    $("input[name='chkTipoVehiculo']:checked").each(function(){

        //Obteniendo ID y nombre del tipo de vehiculo seleccionado para setearlo en el map.
        let l_tipoVehiculoID = this.value;
        let l_tipoVehiculoName = $('#lblTipoVehiculo'+this.value).text();
        mapTipoVehiculo.set(l_tipoVehiculoID, l_tipoVehiculoName);

        //Consultando si posee registros activos.
        $SP().list(GuidListPostulacion[0]).get({
            fields:"ID",
            where:'RUT = "'+l_rut+'" AND Estado = "Pendiente" AND FK_Tipo_Vehiculo = '+l_tipoVehiculoID //+ ' AND FK_Edificio = ' + l_edificio 
        }).then(function(row) {
            
                l_totalRegistros = row.length;
                l_contadorEvaluados++;
                console.log("total registros de " + mapTipoVehiculo.get(l_tipoVehiculoID) + " son: " +l_totalRegistros );
            

                if(l_totalRegistros != 0){
                    //Si posee alguna postulacion pendiente de las seleccionadas en el checkbox se activa flag que impide continuar
                    l_flagPoseeSolicitudesPendientes = true;
                    mapGuarda.set(l_tipoVehiculoID, "NO");
                    msgModal = msgModal + "<div class='pt-2'>" 
                                + "Ya posee solicitud de asignanci&oacute;n de estacionamiento de " +mapTipoVehiculo.get(l_tipoVehiculoID)+"."
                                + "</div>";
                }
                else
                    mapGuarda.set(l_tipoVehiculoID, "SI");


                //Post analis ultimo registro se decide si se guarda o muestra modal.
                if(l_cantidadCheckSelected === l_contadorEvaluados){
                    if(l_flagPoseeSolicitudesPendientes){
                        $("#msjModal").html(msgModal);
                        $("#Modal-ups").modal("show");
                        $( "#loadingGeneral").hide();
                        return false;
                    }
                    else{
                        //Si flag no se activa se procede almacenar
                        //agregarSolicitud(mapGuarda, mapTipoVehiculo);
                        getPosicionInicialPostulacion(mapGuarda, mapTipoVehiculo)
                    }
                }

        });
        
    });

}







/* Validacion postulacion existente por edificio y tipo vehiculo*/
function getPosicionInicialPostulacion(mapTipoVehiculoGuardar, mapTipoVehiculos){
    
    var mapContadorInicial = new Map();

    let l_cantidadCheckSelected = $("input[name='chkTipoVehiculo']:checked").length;
    let l_edificio = $('input:radio[name=radEdificio]:checked').val();

    let l_contadorEvaluados = 0;
    let l_totalRegistros = 0;


    let l_posicion = 0;
    
    //recorriendo los tipos de vehiculos seleccionados para postular
    $("input[name='chkTipoVehiculo']:checked").each(function(){

        
        let l_tipoVehiculoID = this.value;
        //Si se almacena se pregunta por su ultima posicion
        if(mapTipoVehiculoGuardar.get(l_tipoVehiculoID) == "SI"){
            
            //Consultando si posee registros activos.
            $SP().list(GuidListPostulacion[0]).get({
                fields:"ID",
                where:'Estado = "Pendiente" AND FK_Tipo_Vehiculo = '+l_tipoVehiculoID + ' AND FK_Edificio = ' + l_edificio 
            }).then(function(row) {
                
                    l_posicion = row.length + 1;
                    l_contadorEvaluados++;
                    mapContadorInicial.set(l_tipoVehiculoID, l_posicion);

                    //call guardado
                    if(l_cantidadCheckSelected === l_contadorEvaluados){
                            let test;
                            sessionStorage.setItem("mapTipoVehiculoGuardar", JSON.stringify(Array.from(mapTipoVehiculoGuardar.entries())));
                            sessionStorage.setItem("mapTipoVehiculos", JSON.stringify(Array.from(mapTipoVehiculos.entries())));
                            sessionStorage.setItem("mapContadorInicial", JSON.stringify(Array.from(mapContadorInicial.entries())));
                            agregarSolicitud(mapTipoVehiculoGuardar, mapContadorInicial, mapTipoVehiculos);
                    }

            });
        }
        
    });

}



/*Acepto terminos y condiciones*/ 
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

//Funcion que habilita clase de edicion telefono
function habilitarEdit(){
    $( "#antecedenteNumero" ).prop( "readonly", false );
    $( "#antecedenteNumero" ).removeClass( "form-phone-card" ).addClass( "form-phone-card-edit" );

}

