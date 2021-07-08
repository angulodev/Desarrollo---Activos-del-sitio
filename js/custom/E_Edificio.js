//funcion que lista edificios en un combobox para  postulacion interno
function getRadioButtomEdificios(){
    $SP().list(GuidListEdificio[0]).get({
        where:"Activo = 1",
        orderby:"Nombre ASC"
    }).then(function(data) {

        var row ="";
        for (var i=0; i<data.length; i++){

            row = row + 
            "<div class='form-check-inline'>" + 
                "<label class='form-check-label text-form' for='radio"+data[i].getAttribute("Nombre")+"' id='lblTipoEdificio"+data[i].getAttribute("ID")+"' >" + 
                    "<input type='radio' class='form-check-input' name='radEdificio' id='radio"+data[i].getAttribute("Nombre")+"'  value='"+data[i].getAttribute("ID")+"'>" +data[i].getAttribute("Nombre") +
                "</label>" + 
            "</div>";
        }

        $("#divRadioEdicifios").html($("#divRadioEdicifios").html() + row);

    });
}


//funcion que lista edificios en un combobox para  postulacion visita reserva, que activa jquery que escucha cambio permentemente para desplegar calendario
function getRadioButtomEdificiosVisita(){
    $SP().list(GuidListEdificio[0]).get({
        where:"Activo = 1",
        orderby:"Nombre ASC"
    }).then(function(data) {

        var row ="";
        for (var i=0; i<data.length; i++){

            row = row + 
            "<div class='form-check-inline'>" + 
                "<label class='form-check-label text-form' for='radio"+data[i].getAttribute("Nombre")+"' id='lblTipoEdificio"+data[i].getAttribute("ID")+"' >" + 
                    "<input type='radio' class='form-check-input' name='radEdificio' id='radio"+data[i].getAttribute("Nombre")+"'  value='"+data[i].getAttribute("ID")+"'>" +data[i].getAttribute("Nombre") +
                "</label>" + 
            "</div>";
        }

        $("#divRadioEdicifios").html($("#divRadioEdicifios").html() + row);




        //Evento que escucha los cambios en los checkbox de tipo edificio
        $('input[name="radEdificio"]').on('change', function () {
            
            $( "#divFormularioFechaHora" ).show();
            $( "#divCalendarioHoras" ).hide();
            mostrarLoadingDosPadres('loadingPageCalendario');
            //Se inicia proceso de calculo estacionamiento con idEdificioSeleccionado
            //getEstacionamientosVisita($(this).val()); //funcion en postulacionvisita.js
            getEstacionamientosVisita(); //funcion en postulacionvisita.js
         });        

    });
}


function getRadioButtomEdificiosListaPostulaciones(){
    $SP().list(GuidListEdificio[0]).get({
        where:"Activo = 1",
        orderby:"Nombre ASC"
    }).then(function(data) {

        var row ="";
        for (var i=0; i<data.length; i++){

            row = row + 
            "<div class='form-check-inline'>" + 
                "<label class='form-check-label text-form' for='radio"+data[i].getAttribute("Nombre")+"' id='lblTipoEdificio"+data[i].getAttribute("ID")+"' >" + 
                    "<input type='radio' class='form-check-input' name='radEdificio' id='radio"+data[i].getAttribute("Nombre")+"'  value='"+data[i].getAttribute("ID")+"'>" +data[i].getAttribute("Nombre") +
                "</label>" + 
            "</div>";
        }

        $("#divRadioEdicifios").html($("#divRadioEdicifios").html() + row);




        //Evento que escucha los cambios en los checkbox de tipo edificio
        $('input[name="radEdificio"]').on('change', function () {
            mostrarLoadingDosPadres("loadingTable");
            preparaLLamadoPrintTable(0);
         });        



    });
}



function getNameByIDForPostulacionInterno(idEdificio){
    $SP().list(GuidListEdificio[0]).get({
        where:"ID = " + idEdificio
    }).then(function(data) {

        for (var i=0; i<data.length; i++){
            
            $( "#loadingGeneral").hide();
            showModalError("Modal-ups", "msjModal", "Estimado usuario, usted tiene postulación(es) pendiente(s) en el edificio " +data[i].getAttribute("Nombre")+ ".<br> Solo puede generar postulaciones adicionales en un mismo edificio.");
            return false;
           
        }
    });
}


function getEdificioByEstado(estado){
    

    return new Promise(resolve => {
        
        let l_edificioArray = [];
    
        $SP().list(GuidListEdificio[0]).get({
            where:"Activo = " + estado
        }).then(function(data) {

            for (var i=0; i<data.length; i++){
                var v_edificio = NewObjectEdificio();
                v_edificio.ID = data[i].getAttribute("ID")
                v_edificio.Nombre = data[i].getAttribute("Nombre");
                
                l_edificioArray.push(v_edificio);
            
            }

            resolve(l_edificioArray);
        });

    });
}


function getEdificioByID(idEdificio){
    

    return new Promise(resolve => {
        
          
        $SP().list(GuidListEdificio[0]).get({
            where:"ID = " + idEdificio
        }).then(function(data) {

            if(data.length == 0)
                resolve(null);
                
            for (var i=0; i<data.length; i++){
                var v_edificio = NewObjectEdificio();
                v_edificio.ID = data[i].getAttribute("ID")
                v_edificio.Nombre = data[i].getAttribute("Nombre");
                resolve(v_edificio);
            }

            
        });

    });
}