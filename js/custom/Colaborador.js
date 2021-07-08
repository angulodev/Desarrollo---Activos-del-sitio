function GetDatosAntecedentes(){
    $SP().whoami().then(function(iam){
        GetUserAzure(iam["WorkEmail"]);

  });
}
function GetUserAzure(mail){
    fetch(urlEmployeeServices + 'mail='+mail)
    .then(function(response) {
        return response.json();
    })
    .then(function(datosUsuario) {
        console.log(datosUsuario);
        $("#nombreUsuario").html(datosUsuario["fullName"]);    
        $("#rut").val( formateaRut(datosUsuario["rut"]));    
        $("#direccionLaboral").val( datosUsuario["edificio"]);    
        /*
        if(datosUsuario["celular"] == null){
            $( "#telefono" ).prop( "readonly", false );
            $( "#telefono" ).removeClass( "form-control-plaintext" ).addClass( "inp-edit" );
        }
        else
            $("#telefono").val( datosUsuario["celular"]);    
        */
        if(datosUsuario["celular"] == null)
            $("#telefono").val("912345678");

        $("#email").val( datosUsuario["email"]);   
        $("#sociedad").val( datosUsuario["sociedad"]);   
        
    });
}


