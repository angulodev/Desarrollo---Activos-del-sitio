$(document).ready(function() {
    sessionStorage.clear();
    listarMisPostulaciones();
    /* getInfoAutomovil();
    getInfoMoto();
    getInfoBici();
 */
    getContadoresPostulaciones();
});

function getMail(){
    return new Promise(resolve => {
    
        $SP().whoami().then(function(iam){
            resolve(iam["WorkEmail"]);
            
        });
    
    });
}

async function listarMisPostulaciones(){
    mostrarUnPadre("loadingPostulaciones");
    

    let email = await getMail();
    let l_msjPostulacion = "";
    let l_numImput = 1;
    $SP().list(GuidListPostulacion[0]).get({
        fields:"Posicion_Inicial, FK_Tipo_Vehiculo, FK_Edificio ,FK_Edificio_x003a_Nombre, FK_Tipo_Vehiculo_x003a_Nombre_Ti",
        where:'Email = "' + email +'"' 
        //where:"Email = 'dddd@ddd.cl'"
    }).then(function(data) {
        for (var i=0; i<data.length; i++){
            /*console.log(data[i].getAttribute("Posicion_Inicial")+" | "+data[i].getAttribute("FK_Tipo_Vehiculo")+" | "+data[i].getAttribute("FK_Edificio")
            +" | "+data[i].getAttribute("FK_Edificio_x003a_Nombre")
            +" | "+data[i].getAttribute("FK_Tipo_Vehiculo_x003a_Nombre_Ti"));*/
            l_msjPostulacion = l_msjPostulacion.concat("<div class='form-inline text-form-card pb-4 ml-5 col-md-10 col-6'>");
            
            var v_tipoVehiculo = splitFunction(data[i].getAttribute("FK_Tipo_Vehiculo"), ";#", 1);
            if(v_tipoVehiculo == 1) //AUTO
                l_msjPostulacion = l_msjPostulacion.concat("<img class='img-fluid mr-2' src='../SiteAssets/img/auto.svg'>");
            if(v_tipoVehiculo == 2) //MOTO
                l_msjPostulacion = l_msjPostulacion.concat("<img class='img-fluid mr-2' src='../SiteAssets/img/moto.svg' >");
            if(v_tipoVehiculo == 3) //BICI
                l_msjPostulacion = l_msjPostulacion.concat("<img class='img-fluid mr-2' src='../SiteAssets/img/bici.svg' >");

            l_msjPostulacion = l_msjPostulacion.concat("<label for='posicionFila"+l_numImput+"'>Estás en el puesto número</label>");
            l_msjPostulacion = l_msjPostulacion.concat("<input type='text' id='posicionFila"+l_numImput+"' class='form-datos-card form-disponible col-6 col-md-1 border-0' placeholder='121' value = '"+splitFunction(data[i].getAttribute("Posicion_Inicial"), ".", 0)+"' style='text-align: center;' readonly>");
            l_msjPostulacion = l_msjPostulacion.concat("<label for='tipoVehiculoFila"+l_numImput+"'>de lista de espera para</label>");
            l_msjPostulacion = l_msjPostulacion.concat("<input type='text' id='tipoVehiculoFila"+l_numImput+"' class='form-datos-card form-disponible col-6 col-md-2 border-0' placeholder='Automovil' value = '"+splitFunction(data[i].getAttribute("FK_Tipo_Vehiculo_x003a_Nombre_Ti"), ";#", 1)+"'  style='text-align: center;' readonly> ");
            l_msjPostulacion = l_msjPostulacion.concat("<label for='edificioFila"+l_numImput+"'>en</label>");
            l_msjPostulacion = l_msjPostulacion.concat("<input type='text' id='edificioFila"+l_numImput+"' class='form-datos-card col-6 col-md-2 border-0' placeholder='Automovil' value = '"+splitFunction(data[i].getAttribute("FK_Edificio_x003a_Nombre"), ";#", 1)+".'  readonly> ");
            l_msjPostulacion = l_msjPostulacion.concat("</div>");
            
            l_numImput += 1;
        }

        if(data.length > 0){
            $("#divConPostulaciones").html(l_msjPostulacion);
            $("#divConPostulaciones").show();
            $( "#loadingPostulaciones").hide();
        }
        else{
            $("#divSinPostulaciones").show();
            $( "#loadingPostulaciones").hide();
        }
            
    });

    
    
}



async function getContadoresPostulaciones(){
    
    mostrarUnPadre("loadingListEsperaAutomovil");
    mostrarUnPadre("loadingListEsperaMoto");
    mostrarUnPadre("loadingListEsperaBici");

    let l_edificiosArray = await getEdificioByEstado(1);
    let l_postulacionesArray = await getAllPostulacionesByEstado("Pendiente");

    let l_autosArray = [];
    let l_motosArray = [];
    let l_bicisArray = [];

    l_postulacionesArray.forEach(postulacion => {

        switch (postulacion.FK_TipoVehiculo) {
            case "1":
                l_autosArray.push(postulacion);
                break;
            case "2":
                l_motosArray.push(postulacion);
                break;
            case "3":
                l_bicisArray.push(postulacion);
                break;
          }

    });

    getInfoAutomovil(l_edificiosArray, l_autosArray);
    getInfoMoto(l_edificiosArray, l_motosArray);
    getInfoBici(l_edificiosArray, l_bicisArray);

    
}

async function getInfoAutomovil(l_edificiosArray, l_postulacionesArray){
    
    let l_countCostanera = 0;
    let l_countTorreEntel = 0;
    let l_countTitanium = 0;

    let l_msjAutomovil = "";

    l_edificiosArray.forEach(edificio => {

        l_postulacionesArray.forEach(postulacion => {

            if(edificio.Nombre.toUpperCase() == 'TORRE ENTEL' && postulacion.FK_Edificio == edificio.ID)
                l_countTorreEntel += 1;

            if(edificio.Nombre.toUpperCase() == 'COSTANERA' && postulacion.FK_Edificio == edificio.ID)
                l_countCostanera += 1;
            
            if(edificio.Nombre.toUpperCase() == 'TITANIUM' && postulacion.FK_Edificio == edificio.ID)
                l_countTitanium += 1;
     
        });
        
    });
    
    
    $("#countListaEsperaAutoTorreEntel").val(l_countTorreEntel);
    $("#countListaEsperaAutoTitanium").val(l_countTitanium);
    $("#countListaEsperaAutoCostanera").val(l_countCostanera);

    
    $( "#listaEsperaAutomovil").show();
    $( "#loadingListEsperaAutomovil").hide();
    
}




async function getInfoMoto(l_edificiosArray, l_postulacionesArray){
    

    let l_countCostanera = 0;
    let l_countTorreEntel = 0;
    let l_countTitanium = 0;

    let l_msjAutomovil = "";

    l_edificiosArray.forEach(edificio => {

        l_postulacionesArray.forEach(postulacion => {

            if(edificio.Nombre.toUpperCase() == 'TORRE ENTEL' && postulacion.FK_Edificio == edificio.ID)
                l_countTorreEntel += 1;

            if(edificio.Nombre.toUpperCase() == 'COSTANERA' && postulacion.FK_Edificio == edificio.ID)
                l_countCostanera += 1;
            
            if(edificio.Nombre.toUpperCase() == 'TITANIUM' && postulacion.FK_Edificio == edificio.ID)
                l_countTitanium += 1;
     
        });
        
    });
    
    
    $("#countListaEsperaMotoTorreEntel").val(l_countTorreEntel);
    $("#countListaEsperaMotoTitanium").val(l_countTitanium);
    $("#countListaEsperaMotoCostanera").val(l_countCostanera);

    
    $( "#listaEsperaMoto").show();
    $( "#loadingListEsperaMoto").hide();
    
}


async function getInfoBici(l_edificiosArray, l_postulacionesArray){
    
    let l_countCostanera = 0;
    let l_countTorreEntel = 0;
    let l_countTitanium = 0;

    let l_msjAutomovil = "";

    l_edificiosArray.forEach(edificio => {

        l_postulacionesArray.forEach(postulacion => {

            if(edificio.Nombre.toUpperCase() == 'TORRE ENTEL' && postulacion.FK_Edificio == edificio.ID)
                l_countTorreEntel += 1;

            if(edificio.Nombre.toUpperCase() == 'COSTANERA' && postulacion.FK_Edificio == edificio.ID)
                l_countCostanera += 1;
            
            if(edificio.Nombre.toUpperCase() == 'TITANIUM' && postulacion.FK_Edificio == edificio.ID)
                l_countTitanium += 1;
     
        });
        
    });
    
    
    $("#countListaEsperaBiciTorreEntel").val(l_countTorreEntel);
    $("#countListaEsperaBiciTitanium").val(l_countTitanium);
    $("#countListaEsperaBiciCostanera").val(l_countCostanera);

    
    $( "#listaEsperaBici").show();
    $( "#loadingListEsperaBici").hide();
    
}


