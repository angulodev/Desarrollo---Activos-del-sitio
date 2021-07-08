$(document).ready(function() {
    ReadMenu("#menu");
});

function ReadMenu(idUlMenu)
{
    let lstMenu = [];
    $SP().list(GuidListMenu[1]).get({
        where:'vigente = 1',
        orderby:"Ordenamiento ASC,Title ASC"
    }).then(function(data) {
        for (var i=0; i<data.length; i++){
            let oMenu = {Title: data[i].getAttribute("Title"),
                        class: data[i].getAttribute("class"),
                        padre: data[i].getAttribute("padre"),
                        link: data[i].getAttribute("link"),
                        vigente: (data[i].getAttribute("vigente") == 1 ? true : false),
                        audiencia: data[i].getAttribute("audiencia"),
                        ID: data[i].getAttribute("ID"),
                        Ordenamiento: data[i].getAttribute("Ordenamiento")
            };
            lstMenu.push(oMenu);
        }
        let padreMenus = lstMenu.filter(pMenu => {
            return pMenu.padre == "#";
        });
    
        for (var i=0; i<padreMenus.length; i++){
            let hijosMenus = lstMenu.filter(hMenu => {
                return hMenu.padre == padreMenus[i].Title;
            });
            if(hijosMenus.length > 0){
                var row = "<li>"+
                            "<a href='#"+padreMenus[i].Title.replace(/ /g, "").replace("/","") +"_Submenu' data-toggle='collapse' aria-expanded='false' class='dropdown-toggle d-block text-menu py-2 border-0'>"+
                            "<span class='"+padreMenus[i].class+" py-2 icono mr-2'></span>"+padreMenus[i].Title+"</a>"+
                            "<ul class='collapse list-unstyled' id='"+padreMenus[i].Title.replace(/ /g, "").replace("/","") +"_Submenu'>";
                            for (var j=0; j<hijosMenus.length; j++){
                                row += "<li>"+
                                            "<a href='"+hijosMenus[j].link+"' class='d-block text-menu py-2 ml-4 border-0'><span class='"+hijosMenus[j].class+" icono mr-2'></span>"+hijosMenus[j].Title+"</a>"+
                                        "</li>";
                            }
                row += "</ul></li>";
                $(idUlMenu).html($(idUlMenu).html() + row);
            }
            else
            {
                var row = "<li>"+
                            "<a href='"+padreMenus[i].link+"' class='d-block text-menu py-2 border-0'><span class='"+padreMenus[i].class+" icono mr-2'></span>"+padreMenus[i].Title+"</a>"+
                        "</li>";
                $(idUlMenu).html($(idUlMenu).html() + row);
            }
        }
    });
}

function formateaRut(rut) {

    var actual = rut.replace(/^0+/, "");
    if (actual != '' && actual.length > 1) {
        var sinPuntos = actual.replace(/\./g, "");
        var actualLimpio = sinPuntos.replace(/-/g, "");
        var inicio = actualLimpio.substring(0, actualLimpio.length - 1);
        var rutPuntos = "";
        var i = 0;
        var j = 1;
        for (i = inicio.length - 1; i >= 0; i--) {
            var letra = inicio.charAt(i);
            rutPuntos = letra + rutPuntos;
            if (j % 3 == 0 && j <= inicio.length - 1) {
                rutPuntos = "." + rutPuntos;
            }
            j++;
        }
        var dv = actualLimpio.substring(actualLimpio.length - 1);
        rutPuntos = rutPuntos + "-" + dv;
    }
    return rutPuntos;
}


function usuarioApiToObjectUsuario(datosUsuario){

    var Usuario = NewUsuario();

    if(datosUsuario != undefined && datosUsuario != null){
        Usuario.FullName = datosUsuario["fullName"];
        Usuario.RUT = formateaRut(datosUsuario["rut"]);
        Usuario.Edicio = datosUsuario["edificio"];
        Usuario.Email = datosUsuario["email"];
        Usuario.Sociedad = datosUsuario["sociedad"];

        if(datosUsuario["celular"] == null)
            Usuario.Telefono = null; 
        else {
            var numTelefono = datosUsuario["celular"].split(" ");
            Usuario.Telefono = numTelefono[1] + "" + numTelefono[2];
        } 
    } 

    return Usuario;
}


function showAntecedentes(){

    let Usuario = JSON.parse(sessionStorage.getItem("datosUsuario"));

    if(Usuario != undefined && Usuario != null){
        $("#antecedenteNombre").html(Usuario.FullName);//OLD HTML
        $("#antecedenteNombre").val( Usuario.FullName);//for new        
        $("#antecedenteRUT").val( Usuario.RUT);    
        $("#antecedenteDireccion").val( Usuario.Edicio);    
        $("#antecedenteCorreo").val( Usuario.Email);   
        $("#antecedenteSociedad").val( Usuario.Sociedad);   

        if(Usuario.Telefono == null || Usuario.Telefono == 0){
            $( "#antecedenteNumero" ).prop( "readonly", false );
            $( "#antecedenteNumero" ).removeClass( "form-phone-card" ).addClass( "form-phone-card-edit" );
            $("#antecedenteNumero").attr("placeholder", "Ej: 912345678");
        }
        else
            $("#antecedenteNumero").val( Usuario.Telefono);  
    }
}



function showAntecedentesVisita(){

    let UsuarioVisita = JSON.parse(sessionStorage.getItem("datosUsuarioVisita"));

    if(UsuarioVisita != undefined && UsuarioVisita != null){
        //$("#antecedenteNombreVisita").val( UsuarioVisita.FullName);//for new        
        $("#antecedenteNombreVisita").html(UsuarioVisita.FullName);//for label
        $("#antecedenteRUTVisita").val( UsuarioVisita.RUT);    
        $("#antecedenteDireccionVisita").val( UsuarioVisita.Edicio);    
        $("#antecedenteCorreoVisita").val( UsuarioVisita.Email);   
        $("#antecedenteSociedadVisita").val( UsuarioVisita.Sociedad);   

        if(UsuarioVisita.Telefono == null){
            $( "#antecedenteNumeroVisita" ).prop( "readonly", false );
            $( "#antecedenteNumeroVisita" ).removeClass( "form-phone-card" ).addClass( "form-phone-card-edit" );
            $("#antecedenteNumeroVisita").attr("placeholder", "Ej: 912345678");
        }
        else
            $("#antecedenteNumeroVisita").val( UsuarioVisita.Telefono);  
    }


}


function showAntecedentesEstacionamiento(l_Estacionamiento, l_edificio){

    return new Promise(resolve => {
    
        let Usuario = JSON.parse(sessionStorage.getItem("datosUsuarioEstacionamiento"));

        if(Usuario != undefined && Usuario != null){
            $("#antecedenteNombre").html(Usuario.FullName);//OLD HTML
            $("#antecedenteNombre").val( Usuario.FullName);//for new        
            $("#antecedenteRUT").val( Usuario.RUT);    
            $("#antecedenteDireccion").val( Usuario.Edicio);    
            $("#antecedenteCorreo").val( Usuario.Email);   
            $("#antecedenteSociedad").val( Usuario.Sociedad);   

            if(Usuario.Telefono == null || Usuario.Telefono == 0){
                $( "#antecedenteNumero" ).prop( "readonly", false );
                $( "#antecedenteNumero" ).removeClass( "form-phone-card" ).addClass( "form-phone-card-edit" );
                $("#antecedenteNumero").attr("placeholder", "Ej: 912345678");
            }
            else
                $("#antecedenteNumero").val( Usuario.Telefono); 
                
            $("#antecedenteEstacionamiento").val( "Piso: " + l_Estacionamiento.Piso + " Número: " + l_Estacionamiento.Numero);   
            $("#antecedenteEdificio").val( l_edificio.Nombre); 

            resolve(true);
        }
        else
            resolve(false);
    });

    


}


function cleanAntecedentesVisita(){

        $("#antecedenteNombreVisita").html("");//for new        
        $("#antecedenteRUTVisita").val("")
        $("#antecedenteDireccionVisita").val("")   
        $("#antecedenteCorreoVisita").val("")
        $("#antecedenteSociedadVisita").val("")
        $("#antecedenteNumeroVisita").val("") 

}

function cleanAntecedentes(){

    $("#antecedenteNombre").html("");//for new        
    $("#antecedenteRUT").val("");
    $("#antecedenteDireccion").val("")   ;
    $("#antecedenteCorreo").val("");
    $("#antecedenteSociedad").val("");
    $("#antecedenteNumero").val("") ;
    $("#antecedenteEstacionamiento").val("") ;
    $("#antecedenteEdificio").val("") ;

}

function primeraLetraMayuscula(string) {
    return string[0].toUpperCase() + string.slice(1);
}

/*function getRangoFechas(numDias){

    let fechasArray = [];
    let fechaActual = moment();
    fechaActual.locale('es');

    for(i=0; i< numDias ;i++){
        var temp = fechaActual.clone().add(i, 'days');
        console.log(temp.format('ddd'));
        console.log(primeraLetraMayuscula(temp.format('ddd')));
        
        //console.log(temp.format('DD/MM/YYYY'));
        fechasArray.push(temp);
        
    }
    return fechasArray;
}*/



/*
function getRangoFechas(numDias){

    var map = new Map();
	
    let l_fechaActual = moment();
    
    
    for(i=0; i< numDias ;i++){
        var fecha = NewFecha();
        var temp = l_fechaActual.clone().add(i, 'days');
        temp.locale('es');
        fecha.ID = i+1;
        fecha.FechaString = temp.format('YYYY-MM-DD');
        fecha.InicialDia = temp.format('ddd') === "mié" ? "X" : temp.format('ddd')[0].toUpperCase();
        fecha.FechaMoment = temp;
        //console.log(JSON.stringify(fecha) );
        map.set(i+1, fecha);
        
    }
    return map;
}
*/



function getRangoFechasAsync(numDias) {
    return new Promise(resolve => {
        
        var map = new Map();
    
    
        fetch(urlDateServer)
        .then(function(response) {
            return response.json();
        })
        .then(function(fechaServer) {
            
            //let l_fechaActual = moment();
            let l_fechaActual = moment(fechaServer, "DD/MM/YYYY HH:mm:SS");
            
            for(i=0; i< numDias ;i++){
                var fecha = NewFecha();
                var temp = l_fechaActual.clone().add(i, 'days');
                temp.locale('es');
                fecha.ID = i+1;
                fecha.FechaString = temp.format('YYYY-MM-DD');
                fecha.InicialDia = temp.format('ddd') === "mié" ? "X" : temp.format('ddd')[0].toUpperCase();
                fecha.FechaMoment = temp;
                //console.log(JSON.stringify(fecha) );
                map.set(i+1, fecha);
                
            }

            
            map.forEach(function(fecha) {
                console.log(fecha.FechaMoment.format('DD/MM/YYYY HH:MM:SS')); 
                console.log(fecha.FechaMoment.format('MMMM'));   
                console.log(fecha.FechaMoment.format('ddd'));   
        
            });
            
            resolve(map);
            
        })
        .catch(function(error) {
            console.log(error);
            showModalError("Modal-ups", "msjModal", "Estimado usuario, error al obtener fechas");
            resolve(map);
        });

    });
  }
  


function splitFunction(variable, separador, posicion){

    var splitResutl = variable.split(separador);
    return splitResutl[posicion];

}

function showModalError(idModal, idMsjModal, msjModal){
    $("#"+idMsjModal).html(msjModal);
    $("#"+idModal).modal("show");
}

//Validando solo letras, espacio y Ñ,ñ
$(function(){

    $(".sinCaracteresEspeciales").keypress(function (key) {
        //window.console.log(key.charCode)
        if ((key.charCode < 97 || key.charCode > 122)//letras mayusculas
            && (key.charCode < 65 || key.charCode > 90) //letras minusculas
            && (key.charCode != 8) //retroceso
            && (key.charCode != 241) //ñ
             && (key.charCode != 209) //Ñ
             && (key.charCode != 32) //espacio
             && (key.charCode != 225) //á
             && (key.charCode != 233) //é
             && (key.charCode != 237) //í
             && (key.charCode != 243) //ó
             && (key.charCode != 250) //ú
             && (key.charCode != 193) //Á
             && (key.charCode != 201) //É
             && (key.charCode != 205) //Í
             && (key.charCode != 211) //Ó
             && (key.charCode != 218) //Ú
             && (key.charCode != 109) //-
             && (key.charCode != 189) //- numerico

            )
            return false;
    });
     
});

//Validando solo letras, espacio y Ñ,ñ
$(function(){

    $(".letrasyNumeros").keypress(function (key) {
        //window.console.log(key.charCode)
        if ((key.charCode < 97 || key.charCode > 122)//letras mayusculas
            && (key.charCode < 65 || key.charCode > 90) //letras minusculas
            && (key.charCode != 8) //retroceso
            && (key.charCode != 241) //ñ
             && (key.charCode != 209) //Ñ
             && (key.charCode != 32) //espacio
             && (key.charCode != 225) //á
             && (key.charCode != 233) //é
             && (key.charCode != 237) //í
             && (key.charCode != 243) //ó
             && (key.charCode != 250) //ú
             && (key.charCode != 193) //Á
             && (key.charCode != 201) //É
             && (key.charCode != 205) //Í
             && (key.charCode != 211) //Ó
             && (key.charCode != 218) //Ú
             && (key.charCode != 109) //-
             && (key.charCode != 189) //- numerico
             &&(key.charCode < 48 || key.charCode > 57)
            )
            return false;
    });
     
});


//Validando solo digitos en telefono
$(function(){

    $('.telefono').keypress(function(e) {
        if(event.charCode >= 48 && event.charCode <= 57 ){
            return true;
        }
        return false;   
    })
     
});


//Loading Personalizado a div Padre
function mostrarLoadingDosPadres(id){
    let loader = $("#"+id);
    loader.css("height", loader.parent().outerHeight());
    loader.css("width", loader.parent().outerWidth());
    loader.css("margin-top", loader.parent().outerHeight() *-1);
    loader.css("padding-top", loader.parent().outerHeight()/2 - loader.children().outerHeight()/2);
    loader.css("padding-left", loader.parent().outerWidth()/2 - loader.children().outerWidth()/2);
    loader.show();
}


//Loading DIV
function mostrarUnPadre(id){
    let loader = $("#"+id);
    loader.css("height", loader.parent().outerHeight());
    loader.css("width", loader.parent().outerWidth());
    loader.css("padding-top", loader.parent().outerHeight()/2 - loader.children().outerHeight()/2);
    loader.css("padding-left", loader.parent().outerWidth()/2 - loader.children().outerWidth()/2);
    loader.show();
}