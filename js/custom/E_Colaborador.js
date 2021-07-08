/*Función que obtiene los datos del usuario conectado a sharepoint*/ 

function GetDatosAntecedentes(){
    
    mostrarUnPadre('loadingPage');
    
    $SP().whoami().then(function(iam){
        GetUserAzure(iam["WorkEmail"], "INTERNO");
        //GetUserAzure("asd@asd.cl", "INTERNO");

  });
}


async function GetDatosAntecedentesEstacionamiento(l_Email, l_Estacionamiento){
    
    
    let l_edificio = await getEdificioByID(l_Estacionamiento.FK_Edificio);
    sessionStorage.setItem("l_edificio", JSON.stringify(l_edificio));
    
    fetch(urlEmployeeServices + 'mail='+l_Email)
    .then(function(response) {
        return response.json();
    })
    .then(function(datosUsuario) {
        
        if(datosUsuario != null){
            let Usuario = usuarioApiToObjectUsuario(datosUsuario);
            
            sessionStorage.setItem("datosUsuarioEstacionamiento", JSON.stringify(Usuario));
            showAntecedentesEstacionamiento(l_Estacionamiento, l_edificio);
            $( "#loadingPage").hide();
           

        }
        else
        {
            showModalError("Modal-ups", "msjModal", "Estimado usuario, su correo no se encuentra registrado en los sistemas de estacionamientos. Contáctese con un administrador.");
            $( "#loadingPage").hide();
        }
    });
    
}


/*Obtiene los datos del usuario desde azure*/
function GetUserAzure(mail, tipoUsuario){
    fetch(urlEmployeeServices + 'mail='+mail)
    .then(function(response) {
        return response.json();
    })
    .then(function(datosUsuario) {
        
        if(datosUsuario != null){
            let Usuario = usuarioApiToObjectUsuario(datosUsuario);
            
            /*
            $("#antecedenteNombre").html(Usuario.FullName);//OLD HTML
            $("#antecedenteNombre").val( Usuario.FullName);//for new        
            $("#antecedenteRUT").val( Usuario.RUT);    
            $("#antecedenteDireccion").val( Usuario.Edicio);    
            $("#antecedenteCorreo").val( Usuario.Email);   
            $("#antecedenteSociedad").val( Usuario.Sociedad);   

            if(datosUsuario["celular"] == null){
                $( "#antecedenteNumero" ).prop( "readonly", false );
                $( "#antecedenteNumero" ).removeClass( "form-phone-card" ).addClass( "form-phone-card-edit" );
                $("#antecedenteNumero").attr("placeholder", "Ej: 912345678");
            }
            else
                $("#antecedenteNumero").val( Usuario.Telefono);    
            
            sessionStorage.setItem("datosUsuario", JSON.stringify(Usuario));
            */

            if (tipoUsuario == "INTERNO"){
                sessionStorage.setItem("datosUsuario", JSON.stringify(Usuario));
                showAntecedentes();
                $( "#loadingPage").hide();
            }
            if (tipoUsuario == "VISITA"){
                sessionStorage.setItem("datosUsuarioVisita", JSON.stringify(Usuario));
                showAntecedentesVisita();
                $( "#loadingPageVisita").hide();
            }
            if (tipoUsuario == "MIESTACIONAMIENTO"){
                sessionStorage.setItem("datosUsuarioEstacionamiento", JSON.stringify(Usuario));
                showAntecedentesVisita();
                $( "#loadingPageVisita").hide();
            }

        }
        else
        {
            
            $( "#loadingPage").hide();

            if (tipoUsuario == "INTERNO"){
                showModalError("Modal-ups", "msjModal", "Estimado usuario, su correo no se encuentra registrado en los sistemas de estacionamientos. Contáctese con un administrador.");
                $( "#loadingPage").hide();
            }
            if (tipoUsuario == "VISITA"){
                showModalError("Modal-ups", "msjModal", "Estimado usuario, su correo no se encuentra registrado en los sistemas de estacionamientos. Contáctese con un administrador.");
                
                $('#antecedentesVisita').hide();
                cleanAntecedentesVisita();

                $( "#loadingPageVisita").hide();
            }

            
        }
    });

    
}




function GetMail(){
    
    return new Promise(resolve => {
    
        $SP().whoami().then(function(iam){
            resolve(iam["WorkEmail"], "INTERNO");
        });
    });
}


function GetDatosUsuarioByEmail(mail){
    
    return new Promise(resolve => {
    
        fetch(urlEmployeeServices + 'mail='+mail)
    .then(function(response) {
        return response.json();
    })
    .then(function(datosUsuario) {
        
        if(datosUsuario != null){
            let Usuario = usuarioApiToObjectUsuario(datosUsuario);
            resolve(Usuario);
        }
        else
        {   
            resolve(null);
        }
    });



    });
}