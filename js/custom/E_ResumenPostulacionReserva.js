$(document).ready(function() {
   
    //Obteniendo Fecha
    let l_fechaSelected = parseInt(sessionStorage.getItem("idFechaSeleccionada"));
    let l_fechasMap = new Map(JSON.parse(sessionStorage.getItem("l_fechasMap")));
    let l_fecha = l_fechasMap.get(l_fechaSelected);

    //Obteniendo arrays de horas agendadas
    let l_arrayAgenda = JSON.parse(sessionStorage.getItem("l_AgendaArray"));

    //obteniendo estacionamiento asignado
    let l_estacionamientoAsignado = JSON.parse(sessionStorage.getItem("estacionamientoAsignado"));

    //Obteniendo edificio asignado
    let l_edificioAsignado = JSON.parse(sessionStorage.getItem("edificioPostulacion"));

    //Obteniendo datos visita
    let l_datosVisita = JSON.parse(sessionStorage.getItem("visitaEstacionamiento"));


    let a = 0;


    
    $("#inputEdificio").val( l_edificioAsignado.Nombre);    
    $("#inputDia").val( l_fecha.FechaString);    


    //seteando horario
    let l_mensajeHoraa = '';
    if(l_arrayAgenda.length == 0){

        l_mensajeHoraa += l_arrayAgenda[0].HoraInicio + ':00 a ' + l_arrayAgenda[0].HoraFin  + ':00 hrs';
    }
    else{
        l_mensajeHoraa += l_arrayAgenda[0].HoraInicio + ':00 a ' + l_arrayAgenda[l_arrayAgenda.length-1].HoraFin  + ':00 hrs';
    }
    $("#inputHorario").val( l_mensajeHoraa);    



    //seteando antecedentes visita
    if(l_datosVisita.FK_TipoVisita == 1){
        $("#antecedenteNombre").val( l_datosVisita.Nombre);    
        $("#antecedenteDireccion").val( l_datosVisita.Direccion);    
        $("#antecedenteNumero").val("+56 " +l_datosVisita.Telefono);    
        $("#antecedenteSociedad").val( l_datosVisita.Sociedad);    
        $("#antecedenteCorreo").val( l_datosVisita.Correo);    
        $("#antecedenteEstacionamiento").val("N°: " + l_estacionamientoAsignado.Numero + " - Piso: " + l_estacionamientoAsignado.Piso);   
        $("#antecedentePatente").val( l_datosVisita.Patente);    
        $("#antecedenteMotivo").val( l_datosVisita.Motivo.Motivo);  
        $( "#datosVisitaInterno").show();
    }
    else{

        $("#antecedenteNombreVisita").val( l_datosVisita.Nombre);    
        $("#antecedenteCorreoVisita").val( l_datosVisita.Correo);    
        $("#antecedenteNumeroVisita").val("+56 " +l_datosVisita.Telefono);    
        $("#antecedentePatenteVisita").val( l_datosVisita.Patente);    
        $("#antecedenteEmpresaVisita").val( l_datosVisita.Empresa);    
        $("#antecedenteMotivoVisita").val( l_datosVisita.Motivo.Motivo);    
        $("#antecedenteEstacionamientoVisita").val("N°: " + l_estacionamientoAsignado.Numero + " - Piso: " + l_estacionamientoAsignado.Piso);   
        
        $( "#datosVisitaExterno").show();
    
    }
     



});
