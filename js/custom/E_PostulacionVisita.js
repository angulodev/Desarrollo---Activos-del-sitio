$(document).ready(function() {
    sessionStorage.clear();
    showTutorial();

    GetDatosAntecedentes();
    getRadioButtomEdificiosVisita();
    getCheckBoxTipoVehiculo();
    getComboBoxMarcaVehiculosVisita();
    
});

//funcion que muestra el tutorial si no posee registro de no ver mas
async function showTutorial(){

    let l_flagMuestra = await existeNoMostrarMas();
    if(!l_flagMuestra)
        $('#tipsModal').modal("show");
        //$('#tipsModal').modal('toggle')
}

//Funcion registra que no se muestre nuevamente el modal tutorial
function noMostrarTutorial(){
    addNoMostrarMas();
    $('#tipsModal').modal('hide');
}


//Funcion que habilita clase de edicion telefono
function habilitarEdit(){
    $( "#antecedenteNumero" ).prop( "readonly", false );
    $( "#antecedenteNumero" ).removeClass( "form-phone-card" ).addClass( "form-phone-card-edit" );

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

//Funcion para buscar correo interno en api
function findByEmail() {
    let l_correo = $('#inputCorreoVisita').val();
    let validacionCorreo = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;

    if(validacionCorreo.test(l_correo))    {
        $('#divErrorTelefono').hide();

        $('#antecedentesVisita').show();
        mostrarLoadingDosPadres('loadingPageVisita');
        GetUserAzure(l_correo, "VISITA");
    }
    else{
        $('#divErrorEmail').show();
        $('#antecedentesVisita').hide();
        cleanAntecedentesVisita();
        return false;
    }

}

//Evento que escucha tipo usuario interno o externo
$(function(){
    $("input[name='chkTipoUsuarioVisita']").change(function () {
        if($(this).prop('checked')) {

            

            if($(this).val() == "1"){
                getComboBoxMotivoVisita($(this).val(), 'selectMotivoVisitaInterno');
                $( "#formularioInterno" ).show();
                $( "#formularioExterno" ).hide();
            }
            else{
                getComboBoxMotivoVisita($(this).val(), 'selectMotivoVisitaExterno');
                $( "#formularioInterno" ).hide();
                $( "#formularioExterno" ).show();
                
            }
        }
    });
});


//evento que escucha el ingreso de correo en formulario visita interno
$("#inputCorreoVisita").keyup(function(){
    //$("span").text(i += 1);
    let validacionCorreo = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
    let l_correo = $(this).val();

    if(validacionCorreo.test(l_correo) && l_correo.toLowerCase().includes(".cl") )    {
        $('#divErrorEmail').hide();

        $('#antecedentesVisita').show();
        mostrarLoadingDosPadres('loadingPageVisita');
        GetUserAzure(l_correo, "VISITA");
    }
    else if(l_correo == ""){
        $('#divErrorEmail').hide();
        $('#antecedentesVisita').hide();
        cleanAntecedentesVisita();
        return false;
    }
    else{
        $('#divErrorEmail').show();
        $('#antecedentesVisita').hide();
        cleanAntecedentesVisita();
        return false;
    }
  });


//Funcion que obtiene todos los estacionamientos de tipo visita asociados a un edificio
function getEstacionamientosVisita(){
    
    let l_estacionamientosArray = [];
    let l_edificio = $('input:radio[name=radEdificio]:checked').val();

    //Obteniendo Listado de Estacionamientos
    $SP().list(GuidListEstacionamiento[0]).get({
        fields:"ID, Piso, Numero, FK_Edificio, FK_Tipo_Vehiculo, FK_CategoriaEstacionamiento",
        where:'FK_CategoriaEstacionamiento = 2 AND FK_Edificio = ' + l_edificio 
    }).then(function(row) {
        
        for (var i=0; i<row.length; i++){
            var estacionamiento = NewEstacionamiento();
            estacionamiento.ID = row[i].getAttribute("ID");
            estacionamiento.Piso = splitFunction(row[i].getAttribute("Piso"), ".", 0);
            estacionamiento.Numero = splitFunction(row[i].getAttribute("Numero"), ".", 0);
            estacionamiento.FK_Edificio = row[i].getAttribute("FK_Edificio");
            estacionamiento.FK_Tipo_Vehiculo = splitFunction(row[i].getAttribute("FK_Tipo_Vehiculo"), ";", 0);
            estacionamiento.FK_CategoriaEstacionamiento = splitFunction(row[i].getAttribute("FK_CategoriaEstacionamiento"), ";", 0);
            l_estacionamientosArray.push(estacionamiento);

        }

        //console.log(JSON.stringify(l_edificiosArray));
        //Se suben al storage los estacionamientos y se procede a obtener la agenda(calendario de dias ocupados)
        sessionStorage.setItem("estacionamientosVisita", JSON.stringify(l_estacionamientosArray));
        getAgenda(l_estacionamientosArray);
    });
}


//Funcion que obtiene la agenda completa (rango de hora - fecha)
function getAgenda(l_estacionamientosArray){
    
    let l_AgendaArray = [];
    //let l_edificio = $('input:radio[name=radEdificio]:checked').val();

    //Obteniendo Listado de agenda
    $SP().list(GuidListAgenda[0]).get(/*{
        fields:"ID, FK_Edificio, FK_Tipo_Vehiculo, FK_CategoriaEstacionamiento",
        where:'FK_CategoriaEstacionamiento = 2 AND FK_Edificio = ' + l_edificio 
    }*/).then(function(row) {
        
        for (var i=0; i<row.length; i++){
            var agenda = NewAgenda();
            var horaInicioSplit = row[i].getAttribute("Hora_Inicio").split(".");
            var horaFinSplit = row[i].getAttribute("Hora_Fin").split(".");

            agenda.ID = row[i].getAttribute("ID");
            agenda.FechaInicio = row[i].getAttribute("Fecha_Inicio").replace(" 00:00:00","");
            agenda.FechaFin = row[i].getAttribute("Fecha_Fin").replace(" 00:00:00","");
            agenda.HoraInicio = horaInicioSplit[0];
            agenda.HoraFin = horaFinSplit[0];
            agenda.FK_Estacionamiento = splitFunction(row[i].getAttribute("FK_Estacionamiento"), ";", 0);
		    agenda.FK_Visita = splitFunction(row[i].getAttribute("FK_Visita"), ";", 0);
            l_AgendaArray.push(agenda);

        }

        //obtenida la agenda se procede a calcular la disponiblidad de estacionamiento por fech (si la fecha esta full)
        calculaDisponibilidadEstacionamiento(l_estacionamientosArray, l_AgendaArray);
    });
}

//Funcion que determina si una fecha está disponible o no (si posee estacionamientos de reserva disponible)
async function calculaDisponibilidadEstacionamiento(l_estacionamientosArray, l_AgendaArray){
    
    //let l_fechasMap = getRangoFechas(14);
    let l_fechasMap = await getRangoFechasAsync(14);

    //Recorriendo Rango de fechas
    l_fechasMap.forEach((fecha,idFecha)=>{ 
        var v_contadorHorasOcupadas = 0;
        var v_contadorHorasOcupadasTotal = l_estacionamientosArray.length * 24;

        fecha.Estacionamientos = l_estacionamientosArray;
        var v_totalEstacionamientosFull = 0;

        //Recorriendo estacionamientos de tipo visita para el edificio seleccionado
        l_estacionamientosArray.forEach(estacionamiento =>{
            
            v_totalEstacionamientosFull += 1;
            //Recorriendo Registros de agendamiento
            l_AgendaArray.forEach(agenda =>{
                
                if((agenda.FechaInicio === fecha.FechaString) && ( agenda.FK_Estacionamiento == estacionamiento.ID)){
                    //Aumento contador de horas ocupadas del día
                    v_contadorHorasOcupadas += 1;

                    //Creo objeto Hora para Objeto Fecha
                    var hora = NewHoraFecha();
                    hora.ID = agenda.HoraInicio;
                    hora.HoraInicio = agenda.HoraInicio;
                    hora.HoraFin = agenda.HoraFin;
                    hora.Estado = 'Ocupado';
                    hora.Clase = 'Ocupado';
                    hora.ID_Fecha = idFecha;
                    hora.ID_Estaconamiento = estacionamiento.ID;

                    fecha.Horas.push(hora);
                }
            });

        });

        //si las horas ocupadas en agenda es igual a el numero de estacionamientos del edificio * 24 horas entonces esta ocupado
        if(v_contadorHorasOcupadasTotal === v_contadorHorasOcupadas){
            fecha.Estado = 'No Disponible';
            fecha.Clase = 'No Disponible'; 
        }
        else{
            fecha.Estado = 'Disponible';
            fecha.Clase = 'Disponible'; 
        }
    });
    /*
    l_fechasMap.forEach((fecha,idFecha)=>{ 
        console.log("Fecha: " + idFecha);
        console.log(JSON.stringify(fecha));
    })*/
    //una vez calculado si la fecha esta disponible o no, se pinta en el html
    printCalendario(l_fechasMap)

}   


//pinta el calendario y a cada boton de fecha se le implementa la funcion cambiaestadobotonfecha que calcula las horas ocupadas de esa fecha por edificio
function printCalendario(l_fechasMap){

    
                
    let l_divCalendario = "";
    l_divCalendario = l_divCalendario.concat("<div class='form-reservar border pt-2'>");
    l_divCalendario = l_divCalendario.concat("<div class='table-responsive'>");
    l_divCalendario = l_divCalendario.concat("<table class='table'>");
    l_divCalendario = l_divCalendario.concat("<tr>");

    l_fechasMap.forEach((fecha,idFecha)=>{ 
        
        l_divCalendario = l_divCalendario.concat("<td align='center'>");
        /* if(idFecha == 1){
            l_divCalendario = l_divCalendario.concat("<div class='btn-fecha-seleccionada text-fecha-seleccionada' id='divBtnFecha"+idFecha+"' type='button'>");
        }
        else  */
        if(fecha.Estado === "Disponible"){
            fecha.Clase = "btn-fecha-disponible text-fecha-disponible";
            //l_divCalendario = l_divCalendario.concat("<div class='btn-fecha-disponible text-fecha-disponible' id='divBtnFecha"+idFecha+"' value='"+idFecha+"' type='button'>");     
            l_divCalendario = l_divCalendario.concat("<div class='btn-fecha-disponible text-fecha-disponible' id='divBtnFecha"+idFecha+"' value='"+idFecha+"' type='button' onclick='cambiaEstadoBotonFecha("+idFecha+")'>");     
        }else{
            fecha.Clase = "btn-fecha-ocupada text-fecha-ocupada";
            //l_divCalendario = l_divCalendario.concat("<div class='btn-fecha-ocupada text-fecha-ocupada' id='divBtnFecha"+idFecha+"' value='"+idFecha+"' type='button'>"); 
            l_divCalendario = l_divCalendario.concat("<div class='btn-fecha-ocupada text-fecha-ocupada' id='divBtnFecha"+idFecha+"' value='"+idFecha+"' type='button' onclick='cambiaEstadoBotonFecha("+idFecha+")'>"); 
        }

        l_divCalendario = l_divCalendario.concat("<input class='semana float-left border-0' type='text' id='inputSemana"+idFecha+"' placeholder='"+fecha.InicialDia+"' readonly disabled>");
        l_divCalendario = l_divCalendario.concat("<input class='dia float-right text-right border-0' type='text' id='inputDia"+idFecha+"' placeholder='"+fecha.FechaMoment.format('DD')+"' readonly disabled>");
        l_divCalendario = l_divCalendario.concat("<input class='mes float-right text-right border-0' type='text' id='inputMes"+idFecha+"' placeholder='"+primeraLetraMayuscula(fecha.FechaMoment.format('MMMM'))+"' readonly disabled>");
        l_divCalendario = l_divCalendario.concat("</div>");
        l_divCalendario = l_divCalendario.concat("</td>");

        if(idFecha===7){
            l_divCalendario = l_divCalendario.concat("</tr>");
            l_divCalendario = l_divCalendario.concat("<tr>");
        }
        /*
        <td>
            <div class="btn-fecha-disponible text-fecha-disponible" type="button">
                <input class="semana float-left border-0" type="text" id="inputSemana" placeholder="L">
                <input class="dia float-right text-right border-0" type="text" id="inputDia" placeholder="24">
                <input class="mes float-right text-right border-0" type="text" id="inputMes" placeholder="Agosto">
            </div>
        </td>
    */
    })

    l_divCalendario = l_divCalendario.concat("</tr>");
    l_divCalendario = l_divCalendario.concat("</table>");
    l_divCalendario = l_divCalendario.concat("</div>");
    l_divCalendario = l_divCalendario.concat("</div>");

    //se sube al storage el map con las fechas calculadas
    sessionStorage.setItem("l_fechasMap", JSON.stringify(Array.from(l_fechasMap.entries())));

    $("#divCalendario").html(l_divCalendario);
    $( "#divCalendario" ).show();            
    $( "#loadingPageCalendario").hide();
//    console.log(l_divCalendario);

    /*a
    $(function() {
        $("#divBtnFecha").click( function()
             {
                console.log($( this ).val())
             }
        );
    });
    */
    //calculaHorasOcupadasByFecha(1);

}


//funcion que calcula el rango de hora que estsa ocupado por fecha seleccionada
function calculaHorasOcupadasByFecha(l_idFecha){

    let l_fechasMap = new Map(JSON.parse(sessionStorage.getItem("l_fechasMap")));
    let fecha = l_fechasMap.get(l_idFecha);
    fecha.HorasEstado = [];

    //se recorre por rango de 24 horas 
    for (var i=0; i<24; i++){

        l_contadorOcupadoHora = 0;

        //si la hora de la fecha coincide aumenta contador de ocupado (ya que agenda tiene todo lo ocupado)
        fecha.Horas.forEach(hora =>{
            if(hora.HoraInicio == i)
                l_contadorOcupadoHora += 1;
        })


        let HoraEstado = newHoraEstado();
        HoraEstado.ID = i;
		HoraEstado.HoraInicio = i;
        HoraEstado.ID_Fecha = l_idFecha;
        
        //si por hora el contador de horas ocupada es igual a la cantidad de estacionamientos entonces la hora no está disponible
        if(l_contadorOcupadoHora == fecha.Estacionamientos.length){
            HoraEstado.Estado = 'No Disponible';
            HoraEstado.Clase = 'No Disponible'; 
        }
        else{
            HoraEstado.Estado = 'Disponible';
            HoraEstado.Clase = 'Disponible'; 
        }

        //se setea el objeto hora general al arrays de horasestado de la fecha y luego la fecha al map y se actualiza el storage
        fecha.HorasEstado.push(HoraEstado);
        l_fechasMap.set(l_idFecha, fecha);
        sessionStorage.setItem("l_fechasMap", JSON.stringify(Array.from(l_fechasMap.entries())));

    }

    //se pintan las horas de la fecha seleccionadas
    printHorasOcupadasByFecha(l_idFecha);
}



//funcion que pinta las horas de la fecha seleccionada
function printHorasOcupadasByFecha(l_idFecha){

    let mapHorasPrint = maphorasToPrintCalendario();
    let l_fechasMap = new Map(JSON.parse(sessionStorage.getItem("l_fechasMap")));
    let fecha = l_fechasMap.get(l_idFecha);

    let l_divCalendarioHoras = "";
    
                    
              
                
    l_divCalendarioHoras = l_divCalendarioHoras.concat("<form>");
    l_divCalendarioHoras = l_divCalendarioHoras.concat("<div class='form-reservar-hora border pl-2 py-3' >");

    l_divCalendarioHoras = l_divCalendarioHoras.concat("<div class='border-bottom'>");
    l_divCalendarioHoras = l_divCalendarioHoras.concat("<h6 class='text-form-card'>Horas disponibles:</h6>");
    l_divCalendarioHoras = l_divCalendarioHoras.concat("</div>");

    l_divCalendarioHoras = l_divCalendarioHoras.concat("<div class='table-responsive'>");     
    
    l_divCalendarioHoras = l_divCalendarioHoras.concat("<table width='100%' cellpadding='6' cellspacing='0' >");
    l_divCalendarioHoras = l_divCalendarioHoras.concat("<tr>");

        fecha.HorasEstado.forEach(hora =>{
            l_divCalendarioHoras = l_divCalendarioHoras.concat("<td>");

            if(hora.Estado === "Disponible"){
                fecha.Clase = "btn-hora-disponible text-hora-disponible";
                l_divCalendarioHoras = l_divCalendarioHoras.concat("<div class='btn-hora-disponible text-hora-disponible' id='divBtnHora"+hora.ID+"' type='button' onclick='seleccionaHoras("+hora.ID+")' >");     
            }else{
                hora.Clase = "btn-hora-ocupada text-hora-ocupada";
                l_divCalendarioHoras = l_divCalendarioHoras.concat("<div class='btn-hora-ocupada text-hora-ocupada' id='divBtnHora"+hora.ID+"' type='button' >"); 
            }

            l_divCalendarioHoras = l_divCalendarioHoras.concat("<input class='hora border-0 text-center' type='text' id='inputSemana"+hora.ID+"' placeholder='"+mapHorasPrint.get(hora.ID)+"' readonly disabled>");
            l_divCalendarioHoras = l_divCalendarioHoras.concat("<input type='hidden' id='idFechaHora"+hora.ID+"' value = '"+l_idFecha+"' readonly> ");
            l_divCalendarioHoras = l_divCalendarioHoras.concat("</div>");
            l_divCalendarioHoras = l_divCalendarioHoras.concat("</td>");

            if(hora.ID === 7 || hora.ID === 15){
                l_divCalendarioHoras = l_divCalendarioHoras.concat("</tr>");
                l_divCalendarioHoras = l_divCalendarioHoras.concat("<tr>");
            }

        })

            
        l_divCalendarioHoras = l_divCalendarioHoras.concat("</tr>");
        l_divCalendarioHoras = l_divCalendarioHoras.concat("</table>");
        l_divCalendarioHoras = l_divCalendarioHoras.concat("</div>");
        l_divCalendarioHoras = l_divCalendarioHoras.concat("</div>");
        l_divCalendarioHoras = l_divCalendarioHoras.concat("</form>");

                                                      
        sessionStorage.setItem("idFechaSeleccionada", l_idFecha);
        $("#divCalendarioHoras").empty();         
        $("#divCalendarioHoras").html(l_divCalendarioHoras);
        $( "#divCalendarioHoras" ).show();

}




//funcion que cambia el estado de la fecha ocupado y deselecciona el resto y la deja segun estado calculado previamente y llama calular horas ocupada por fecha
function cambiaEstadoBotonFecha(l_idFecha){
    
    let nombreButton = 'divBtnFecha';
    let l_fechasMap = new Map(JSON.parse(sessionStorage.getItem("l_fechasMap")));

    //$( "#antecedenteNumero" ).removeClass( "form-phone-card" ).addClass( "form-phone-card-edit" );

    for(var i = 1; i<15; i++){
        var fecha =    l_fechasMap.get(i);
        
        if(i == l_idFecha)
            $( "#"+nombreButton+i ).removeClass(fecha.Clase).addClass( "btn-fecha-seleccionada text-fecha-seleccionada" );
        else{
            $( "#"+nombreButton+i ).removeAttr('class');
            $( "#"+nombreButton+i ).attr('class', fecha.Clase);
        }

    }

    calculaHorasOcupadasByFecha(l_idFecha);

}



//funcion que se gatilla cuando se slecciona una hora
function seleccionaHoras(l_idBotonHora){
    
    let l_nombreButton = 'divBtnHora';
    let l_horasSeleccionadas = $( ".btn-hora-seleccionada" ).length; //cantidad de fechas seleccionadas 

    let l_idFecha = $('#idFechaHora'+l_idBotonHora).val();
    let l_fechasMap = new Map(JSON.parse(sessionStorage.getItem("l_fechasMap")));
    let l_fecha = l_fechasMap.get(parseInt(l_idFecha ));

    //Se genera array con los id de las horas seleccionadas ya en el calendario
    let l_idSelecionadosArray = [];
    for(var i = 0; i<24; i++){
        var esSeleccionado  =    $( "#"+l_nombreButton+i ).hasClass( "btn-hora-seleccionada" );
        if(esSeleccionado)
            l_idSelecionadosArray.push(i);
    }


    let esSecuencial = (calcularSecuencialidad(l_idSelecionadosArray, l_idBotonHora));


    let esUnBotonYaSeleccionado = $( "#"+l_nombreButton+l_idBotonHora ).hasClass( "btn-hora-seleccionada");
    let esUnBotonYaSeleccionadoOcupado = $( "#"+l_nombreButton+l_idBotonHora ).hasClass( "btn-hora-ocupada" );

    if(l_horasSeleccionadas < 4 || esUnBotonYaSeleccionado || esUnBotonYaSeleccionadoOcupado){
        if(esSecuencial){
            
                    //Si es una hora que se quiere seleccionar...
                    if(!esUnBotonYaSeleccionado && !esUnBotonYaSeleccionadoOcupado){
                        

                        l_idSelecionadosArray.push(l_idBotonHora);
                        sessionStorage.setItem("idHorasSeleccionadas", JSON.stringify(l_idSelecionadosArray));

                        if(validaDisponibilidadEstacionamiento())
                            $( "#"+l_nombreButton+l_idBotonHora ).removeClass( "form-phone-card" ).addClass( "btn-hora-seleccionada text-hora-seleccionada" );
                        else{
                            $( "#"+l_nombreButton+l_idBotonHora ).removeClass( "form-phone-card" ).addClass( "btn-hora-ocupada text-hora-ocupada" );
                            showModalError("Modal-ups", "msjModal", "Estimado usuario, la hora seleccionada no cuenta con el mismo estacionamiento disponible para el rango previo.");
                        }

                    }
                    else{
                        //Si es una hora que se quiere deseleccionar se dejará con su clase/estado por defecto...
                        l_fecha.HorasEstado.forEach(hora =>{

                            if(hora.ID == l_idBotonHora){
                                

                                if(esUnBotonYaSeleccionado)
                                    $( "#"+l_nombreButton+l_idBotonHora ).removeClass( "btn-hora-seleccionada text-hora-seleccionada" ).addClass( hora.Clase);
                                else
                                    $( "#"+l_nombreButton+l_idBotonHora ).removeClass( "btn-hora-ocupada text-hora-ocupada" ).addClass( hora.Clase);
                                    
                                
                                
                            
                            }

                        });

                        //Se elimina la hora seleccionada del array de seleccionados y se recalcula los estacionamientos disponibles
                        const index = l_idSelecionadosArray.indexOf(parseInt(l_idBotonHora));
                        if (index > -1) {
                            l_idSelecionadosArray.splice(index, 1);
                        }
                        sessionStorage.setItem("idHorasSeleccionadas", JSON.stringify(l_idSelecionadosArray));

                        validaDisponibilidadEstacionamiento();
                    }

        }
        else{
            showModalError("Modal-ups", "msjModal", "Estimado usuario, la hora seleccionada debe ser secuencial.");
            return false;
        }
    }
    else {
        showModalError("Modal-ups", "msjModal", "Estimado usuario, ya posee 4 horas seleccionadas.");
        return false;
    }
    /*
    l_idSelecionadosArray.push(l_idBotonHora);
    sessionStorage.setItem("idHorasSeleccionadas", JSON.stringify(l_idSelecionadosArray));
    
    validaDisponibilidadEstacionamiento();
    */
}


//Funcion que determina si la hora seleccionada es correlativa.
function calcularSecuencialidad(l_idSeleccionadosArray, l_idSeleccionado){
    
    //Si no hay ninguo seleccionado
    if(l_idSeleccionadosArray.length > 0){
        
        //Si solo existe uno seleccionado
        if(l_idSeleccionadosArray.length > 1){
            for(var i = 0; i<l_idSeleccionadosArray.length-1; i++){
                var dif = l_idSeleccionadosArray[i+1] - l_idSeleccionadosArray[i];
                if(  dif != 1 )
                    return false;
            }
        }

        if( (l_idSeleccionadosArray[0] - l_idSeleccionado == 1) || (l_idSeleccionadosArray[0] - l_idSeleccionado == 0))
            return true;
        else if( (l_idSeleccionado - l_idSeleccionadosArray[l_idSeleccionadosArray.length-1] == 1) || (l_idSeleccionado - l_idSeleccionadosArray[l_idSeleccionadosArray.length-1] == 0)   )
            return true;
        else 
            return false;

    }

    return true;
    
}

//Funcion que determina si un estacionamiento esta disponible las horas seleccionadas de forma consecutiva
function validaDisponibilidadEstacionamiento(){

    let l_estacionamientosArray = JSON.parse(sessionStorage.getItem("estacionamientosVisita")); 
    let l_fechaSelected = sessionStorage.getItem("idFechaSeleccionada");
    let l_fechasMap = new Map(JSON.parse(sessionStorage.getItem("l_fechasMap")));
    let l_fecha = l_fechasMap.get(parseInt(l_fechaSelected));
    //se obtiene las horas seleccionadas desde el storage
    let l_horasSelected = JSON.parse(sessionStorage.getItem("idHorasSeleccionadas"));

    let l_horasArray = l_fecha.Horas;
    let l_flagDisponibilidad = false;

    //Se declara array para ir almacenando estacionamientos disponibles
    let l_listaEstacionamientoDisponibles =  JSON.parse(sessionStorage.getItem("estacionamientosDisponibles"));
    if(l_listaEstacionamientoDisponibles === undefined || l_listaEstacionamientoDisponibles == null)
        l_listaEstacionamientoDisponibles = [];


    //si existen horas seleccionadas se valida el proceso
    if(l_horasSelected.length != 0){
        //se recorren los estacionamientos de tipo visita del edificio seleccionado
        l_estacionamientosArray.forEach(estacionamiento => {
            
                //se pregunta si el estacionamiento existe en el arraydehoras de la fecha y si la hora seleccionada tambien existe, si existe es porque esta ocupado
                var resultado = l_horasArray.filter(hora => l_horasSelected.includes(parseInt(hora.HoraInicio)) && hora.ID_Estaconamiento == estacionamiento.ID);
                if(resultado.length == 0){
                    l_flagDisponibilidad = true;
                    
                    if( !l_listaEstacionamientoDisponibles.includes( parseInt(estacionamiento.ID) ))
                        l_listaEstacionamientoDisponibles.push(parseInt(estacionamiento.ID));

                    sessionStorage.setItem("estacionamientosDisponibles", JSON.stringify(l_listaEstacionamientoDisponibles));
                }
                else{
                    const index = l_listaEstacionamientoDisponibles.indexOf(parseInt(estacionamiento.ID));
                    if (index > -1) {
                        l_listaEstacionamientoDisponibles.splice(index, 1);
                    }
                    sessionStorage.setItem("estacionamientosDisponibles", JSON.stringify(l_listaEstacionamientoDisponibles));
                }
        });
        
        return l_flagDisponibilidad;
    }
    else{
        sessionStorage.setItem("estacionamientosDisponibles", JSON.stringify([]));
        return true;
    }
}


function validaFormulario(){

    $( "#loadingGeneral").show();

    let l_telefono = $('#antecedenteNumero').val();
    let l_edificio = $('input:radio[name=radEdificio]:checked').val();
    let l_tipoVisita = $('input:radio[name=chkTipoUsuarioVisita]:checked').val();
    //let l_cantidadCheckSelected = $("input[name='chkTipoVehiculo']:checked").length;
    let l_rut = $('#antecedenteRUT').val().replace(/[.]/g,"");
    
 
    
    //Validacion datos usuario en api
    if(l_rut == ""){
        $( "#loadingGeneral").hide();
        showModalError("Modal-ups", "msjModal", "Estimado usuario, usted no existe registrado en nuestros sistemas. Contactese con un administrador.");
        
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
        $( "#loadingGeneral").hide();
        showModalError("Modal-ups", "msjModal", "Estimado usuario, debe seleccionar el edificio al cual quiere postular.");
        return false;
    }
    else{
        //Validando seleccion de fecha y hora
        var v_cantidadFecha = $( ".btn-fecha-seleccionada" ).length;
        var v_cantidadHoras = $( ".btn-hora-seleccionada" ).length;

        if(v_cantidadFecha == 0){
            $( "#loadingGeneral").hide();
            showModalError("Modal-ups", "msjModal", "Estimado usuario, debe seleccionar una fecha para poder reservar un estacionamiento.");
            return false;
        }

        if(v_cantidadHoras == 0){
            $( "#loadingGeneral").hide();
            showModalError("Modal-ups", "msjModal", "Estimado usuario, debe seleccionar el rango horario en que reservará el estacionamiento (no superior a 4 horas).");
            return false;
        }

    }
        
    //validacion seleccion tipo vehiculo
    if(l_tipoVisita === undefined){
        $( "#loadingGeneral").hide();
        showModalError("Modal-ups", "msjModal", "Estimado usuario, debe seleccionar el tipo de usuario visitante para el cual realiza la reserva.");
        return false;
    } 
    else{
        //Validando tipo de usuario interno
        if(l_tipoVisita == "1"){
            var v_rutVisita = $('#antecedenteRUTVisita').val();

            if(v_rutVisita == ""){
                $( "#loadingGeneral").hide();
                showModalError("Modal-ups", "msjModal", "Estimado usuario, el visitante de tipo interno no existe registrado en nuestros sistemas. Contactese con un administrador.");
                return false;
            }

            var v_patenteInterno = $('#patenteVisitaInterno').val();
            var v_selectMotivoInterno = $('#selectMotivoVisitaInterno').val();
            var v_motivoVisitaInternoOtro = $('#otroMotivoInterno').val();

            if(v_patenteInterno == ""){
                $( "#loadingGeneral").hide();
                showModalError("Modal-ups", "msjModal", "Estimado usuario, debe ingresar la patente del vehículo del visitante.");
                return false;
            }

            if(v_selectMotivoInterno == 0){
                $( "#loadingGeneral").hide();
                showModalError("Modal-ups", "msjModal", "Estimado usuario, debe seleccionar el motivo de la visita.");
                return false;
            }

            //si el motivo de visita es otro y no ha ingresado motivo visita
            if(v_selectMotivoInterno == 5 && v_motivoVisitaInternoOtro == ""){
                $( "#loadingGeneral").hide();
                showModalError("Modal-ups", "msjModal", "Estimado usuario, debe ingresar el motivo de su visita.");
                return false;
            }
        }
        else{
            //Valaidacion de externo
            var v_nombreVisita = $('#nombreVisitaExterno').val();
            var v_correoVisita = $('#correoVisitaExterno').val();
            var v_telefonoVisita = $('#telefonoVisitaExterno').val();
            var v_patenteVisita = $('#patenteVisitaExterno').val();
            var v_marcaVisita = $('#selectMarca').val();
            var v_motivoVisita = $('#motivoVisitaExterno').val();
            var v_selectMotivoVisita = $('#selectMotivoVisitaExterno').val();
            var v_motivoVisitaExternoOtro = $('#otroMotivoExterno').val();

            var v_empresaVisita = $('#empresaVisitaExterno').val();

            let v_validacionCorreo = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
            let v_validacionSinCaracteresEspeciales = /^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]*$/;
            let v_correoValido = v_validacionCorreo.test(v_correoVisita);


            if(v_nombreVisita == ""){
                $( "#loadingGeneral").hide();
                showModalError("Modal-ups", "msjModal", "Estimado usuario, debe ingresar el nombre completo del visitante.");
                return false;
            }
            /*
            if(!v_validacionSinCaracteresEspeciales.test(v_nombreVisita)){
                $( "#loadingGeneral").hide();
                showModalError("Modal-ups", "msjModal", "Estimado usuario, el nombre del visitante no puede tener caracteres especiales.");
                return false;
            }
            */

            if(v_correoVisita == ""){
                $( "#loadingGeneral").hide();
                showModalError("Modal-ups", "msjModal", "Estimado usuario, debe ingresar el correo electrónico del visitante.");
                
                return false;
            }
            else if(!v_correoValido){
                showModalError("Modal-ups", "msjModal", "Estimado usuario, el correo electrónico del visitante tiene formato incorrecto.");
                //$('#divErrorEmailVisita').show();
                $( "#loadingGeneral").hide();
                
                return false;
            }
            /* else
                $('#divErrorEmailVisita').hide(); */
            
            
            if(v_telefonoVisita == ""){
                $( "#loadingGeneral").hide();
                showModalError("Modal-ups", "msjModal", "Estimado usuario, debe ingresar el teléfono de contacato del visitante.");
                return false;
            }
            else if(v_telefonoVisita != null && v_telefonoVisita.length != 9){
                //$('#divErrorTelefonoVisitaExterno').show();
                showModalError("Modal-ups", "msjModal", "Estimado usuario, el número de teléfono del visitante tiene debe tener 9 dígitos.");
                $( "#loadingGeneral").hide();
                
                return false;
            }
            /* else
                $('#divErrorTelefonoVisitaExterno').hide(); */


            if(v_patenteVisita == ""){
                $( "#loadingGeneral").hide();
                showModalError("Modal-ups", "msjModal", "Estimado usuario, debe ingresar la patente del vehículo del visitante.");
                return false;
            }

            if(v_marcaVisita == 0){
                $( "#loadingGeneral").hide();
                showModalError("Modal-ups", "msjModal", "Estimado usuario, debe seleccionar la marca del vehículo del visitante.");
                return false;
            }

            if(v_selectMotivoVisita == 0){
                $( "#loadingGeneral").hide();
                showModalError("Modal-ups", "msjModal", "Estimado usuario, debe seleccionar el motivo de la visita.");
                return false;
            }

            //si el motivo de visita es otro y no ha ingresado motivo visita
            if(v_selectMotivoVisita == 10 && v_motivoVisitaExternoOtro == ""){
                $( "#loadingGeneral").hide();
                showModalError("Modal-ups", "msjModal", "Estimado usuario, debe ingresar el motivo de la visita.");
                return false;
            }

            if(v_empresaVisita == ""){
                $( "#loadingGeneral").hide();
                showModalError("Modal-ups", "msjModal", "Estimado usuario, debe indicar que empresa representa el visitante.");
                return false;
            }


        }   
    }
    
    
    registrarVisita();
    
}




async function registrarVisita(){

    let l_edificio = parseInt($('input:radio[name=radEdificio]:checked').val());
    let l_edificioName = $('#lblTipoEdificio'+l_edificio).text();
    
    let edificio = NewObjectEdificio();
    edificio.Nombre = l_edificioName;
    edificio.ID= l_edificio;
    sessionStorage.setItem("edificioPostulacion", JSON.stringify(edificio));

    let l_motivoVisita = NewMotivoVisita();

    let l_visita = NewVisita();
    //Obteniendo dataos de visita.
    let l_tipoVisita = parseInt($('input:radio[name=chkTipoUsuarioVisita]:checked').val());
    
    
    //Si es de tipo visita interno.
    if(l_tipoVisita == 1){
        l_visita.Nombre = $('#antecedenteNombreVisita').html();
        l_visita.Rut = $('#antecedenteRUTVisita').val().replace(/[.]/g,"");;
        l_visita.Telefono = parseInt($('#antecedenteNumeroVisita').val());
        l_visita.Correo = $('#antecedenteCorreoVisita').val();
        l_visita.Direccion = $('#antecedenteDireccionVisita').val();
        l_visita.Sociedad = $('#antecedenteSociedadVisita').val();     
        
        l_motivoVisita.ID = $('#selectMotivoVisitaInterno').val();
        if(l_motivoVisita.ID == 5){ //si el id del motivo de la visita es otro entonces se obtiene el nombre desde el input
            l_motivoVisita.Motivo = $('#otroMotivoInterno').val();
            l_motivoVisita = await addMotivoOtro (l_motivoVisita, l_tipoVisita);
        }
        else
            l_motivoVisita.Motivo = $( "#selectMotivoVisitaInterno option:selected" ).text();

        l_visita.Patente = $('#patenteVisitaInterno').val();
        l_visita.Motivo = l_motivoVisita;
    }
    else{

        l_motivoVisita.ID = $('#selectMotivoVisitaExterno').val();
        if(l_motivoVisita.ID == 10){ //si el id del motivo de la visita es otro entonces se obtiene el nombre desde el input
            l_motivoVisita.Motivo = $('#otroMotivoExterno').val();
            l_motivoVisita = await addMotivoOtro (l_motivoVisita, l_tipoVisita);
        }
        else
            l_motivoVisita.Motivo = $( "#selectMotivoVisitaExterno option:selected" ).text();
        

        l_visita.Nombre = $('#nombreVisitaExterno').val();
        l_visita.Correo = $('#correoVisitaExterno').val();
        l_visita.Telefono = parseInt($('#telefonoVisitaExterno').val());
        l_visita.Patente = $('#patenteVisitaExterno').val();
        l_visita.FK_MarcaVehiculo = parseInt($('#selectMarca').val());
        l_visita.Motivo = l_motivoVisita;
        l_visita.Empresa = $('#empresaVisitaExterno').val();
    }
    
    l_visita.FK_TipoVisita = l_tipoVisita;
    l_visita.FK_Edificio = l_edificio;

    //set correo del solicitante

    l_visita.Correo_Solicitante = $('#antecedenteCorreo').val();

    if(l_visita.FK_TipoVisita == 1)
        almacenaVisitaInterno(l_visita);
    else
        almacenaVisitaExterno(l_visita)

}



function almacenaVisitaInterno(l_visita){
    
    //Almacenndo Visita
     $SP().list(GuidListVisita[0]).add({
        Nombre: l_visita.Nombre,
        RUT: l_visita.Rut,
		Correo: l_visita.Correo,
		Telefono: l_visita.Telefono,
		FK_TipoVisita: l_visita.FK_TipoVisita,
        FK_Edificio: l_visita.FK_TipoVisita,
        Patente: l_visita.Patente,
        FK_MotivoVisita: l_visita.Motivo.ID,
        Correo_Solicitante: l_visita.Correo_Solicitante
	}).then(function(items) {   
        if (items.failed.length > 0) {
            for (let i=0; i < items.failed.length; i++) 
                console.log("Error al almacenar solicitud: '"+items.failed[i].errorMessage); // the 'errorMessage' attribute is added to the object
                $( "#loadingGeneral").hide();
        }
        if (items.passed.length > 0) {
            for (let i=0; i < items.passed.length; i++){
                l_visita.ID = items.passed[i].ID;
                sessionStorage.setItem("visitaEstacionamiento", JSON.stringify(l_visita));
            }


            almacenaAgenda(l_visita);
        }

        //llamar funcion almacena agendaa
        
    });

}

function almacenaVisitaExterno(l_visita){

    //Almacenndo Visita$ctrl
    $SP().list(GuidListVisita[0]).add({
        Nombre: l_visita.Nombre,
        Correo: l_visita.Correo,
		Telefono: l_visita.Telefono,
		FK_TipoVisita: l_visita.FK_TipoVisita,
		FK_Edificio: l_visita.FK_TipoVisita,
		Patente: l_visita.Patente,
		FK_Marca_Vehiculo: l_visita.FK_MarcaVehiculo,
        //Motivo: l_visita.Motivo,
        FK_MotivoVisita: l_visita.Motivo.ID,
        Empresa: l_visita.Empresa,
        Correo_Solicitante: l_visita.Correo_Solicitante 

    }).then(function(items) {   
        if (items.failed.length > 0) {
            for (let i=0; i < items.failed.length; i++) 
                console.log("Error al almacenar solicitud: '"+items.failed[i].errorMessage); // the 'errorMessage' attribute is added to the object
                $( "#loadingGeneral").hide();
        }
        if (items.passed.length > 0) {
            for (let i=0; i < items.passed.length; i++){
                l_visita.ID = items.passed[i].ID;
                sessionStorage.setItem("visitaEstacionamiento", JSON.stringify(l_visita));
            }


            almacenaAgenda(l_visita);
        }

        //llamar funcion almacena agendaa
        
    });

}



function almacenaAgenda(l_visita){
  
     //Obteniendo Fecha
     let l_fechaSelected = parseInt(sessionStorage.getItem("idFechaSeleccionada"));
     let l_fechasMap = new Map(JSON.parse(sessionStorage.getItem("l_fechasMap")));
     let l_fecha = l_fechasMap.get(l_fechaSelected);
     //Obteniendo horas seleccionadas
     let l_horasSelected = JSON.parse(sessionStorage.getItem("idHorasSeleccionadas"));
     
     //Obteniendo edificios disponibles para asignar
     let l_edificiosDisponibles = JSON.parse(sessionStorage.getItem("estacionamientosDisponibles"));
     let l_AgendaArray = [];

     let l_estacionamientosArray = JSON.parse(sessionStorage.getItem("estacionamientosVisita")); 
     let l_listaEstacionamientoDisponibles =  JSON.parse(sessionStorage.getItem("estacionamientosDisponibles"));
     let l_estacionamiento;

     l_estacionamientosArray.forEach(estacionamiento => {
                if(estacionamiento.ID == l_listaEstacionamientoDisponibles[0]){
                    l_estacionamiento = estacionamiento;
                    sessionStorage.setItem("estacionamientoAsignado", JSON.stringify(l_estacionamiento));
                }
     });
    
     let l_horasInsertadas = 0;
     
     //recorriendo las horas a ocupar
     l_horasSelected.forEach(hora => {
        
        l_horasInsertadas += 1;

        $SP().list(GuidListAgenda[0]).add({
            Fecha_Inicio: l_fecha.FechaString,
            Fecha_Fin: l_fecha.FechaString,
            FK_Estacionamiento: l_estacionamiento.ID,
            FK_Visita: l_visita.ID, 
            Hora_Inicio: hora,
            Hora_Fin: (hora + 1)
    
        }).then(function(items) {   
            if (items.failed.length > 0) {
                for (let i=0; i < items.failed.length; i++) 
                    console.log("Error al almacenar solicitud: '"+items.failed[i].errorMessage+"'  para tipo vehiculo :"+ l_tipoVehiculoID); // the 'errorMessage' attribute is added to the object
                    $( "#loadingGeneral").hide();
            }

            if (items.passed.length > 0) {
                for (let i=0; i < items.passed.length; i++){
                    let l_agenda = NewAgenda();
                    l_agenda.FechaInicio = l_fecha.FechaString;
                    l_agenda.FechaFin = l_fecha.FechaString;
                    l_agenda.HoraInicio = hora;
                    l_agenda.HoraFin = (hora + 1);
                    l_agenda.FK_Estacionamiento = l_estacionamiento.ID;
                    l_agenda.FK_Visita = l_visita.ID;
                    l_agenda.ID = items.passed[i].ID;

                    l_AgendaArray.push(l_agenda);
                    
                }
            }

            if (l_horasInsertadas == l_horasSelected.length)   {
                sessionStorage.setItem("l_AgendaArray", JSON.stringify(l_AgendaArray));
                $( "#loadingGeneral").hide();
                location.href='fichaResumenReservar.aspx';
            }


        });
  

    });
}




//Si el select de motivo visita cambia
$(function () {
    
  $('#selectMotivoVisitaInterno').change(function() {
        //si su valor es 5 (otro motivo) muestra div de input otro motivo
        if(this.value == 5)
            $('#divOtroMotivoInterno').show();
        else
            $('#divOtroMotivoInterno').hide();
    });
});

//Si el select de motivo visita externo cambia
$(function () {
    
  $('#selectMotivoVisitaExterno').change(function() {
        //si su valor es 10 (otro motivo) muestra div de input otro motivo
        if(this.value == 10)
            $('#divOtroMotivoExterno').show();
        else 
            $('#divOtroMotivoExterno').hide();
    });
});

