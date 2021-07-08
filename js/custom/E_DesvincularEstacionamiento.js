$(document).ready(function() {
    sessionStorage.clear();

});



//evento que escucha el ingreso de correo en formulario visita interno
$("#inputCorreo").keyup(function(){
    //$("span").text(i += 1);
    let validacionCorreo = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
    let l_correo = $(this).val();

    if(validacionCorreo.test(l_correo) && l_correo.toLowerCase().includes(".cl") )    {
        $('#divErrorEmail').hide();

        mostrarLoadingDosPadres('loadingAntecedentes');
        getDatosEstacionamientos(l_correo);
    }
    else if(l_correo == ""){
        $('#divErrorEmail').hide();
        $('#antecedentesUsuario').hide();
        cleanAntecedentes();
        return false;
    }
    else{
        $('#divErrorEmail').show();
        $('#antecedentesUsuario').hide();
        cleanAntecedentes();
        return false;
    }
  });



  async function getDatosEstacionamientos(l_correo){

    let l_usuarioEstacionamiento = await  getUsuarioEstacionamientoByEmail(l_correo);
    let l_estacionamiento = null;

    if(l_usuarioEstacionamiento != null){
        l_estacionamiento = await getEstacionamientoByID(l_usuarioEstacionamiento.FK_Estacionamiento);

        let l_edificio = await getEdificioByID(l_estacionamiento.FK_Edificio);
        sessionStorage.setItem("l_edificio", JSON.stringify(l_edificio));

        //set variables session
        sessionStorage.setItem("l_estacionamiento", JSON.stringify(l_estacionamiento));
        sessionStorage.setItem("l_usuarioEstacionamiento", JSON.stringify(l_usuarioEstacionamiento));
        
        $('#antecedentesUsuario').show();
        let l_usuario = await GetDatosUsuarioByEmail(l_correo);
        sessionStorage.setItem("datosUsuarioEstacionamiento", JSON.stringify(l_usuario));
        
        let flag = await showAntecedentesEstacionamiento(l_estacionamiento, l_edificio);
        $('#loadingAntecedentes').hide();
        
        //GetDatosAntecedentesEstacionamiento(l_correo, l_estacionamiento);
        
        //showModalError("Modal-ups", "msjModal", "Estimado usuario, su correo no se encuentra registrado en los sistemas de estacionamientos. Contáctese con un administrador.");
    }
    else{
        showModalError("Modal-ups", "msjModal", "Estimado usuario, el correo ingresado no posee estacionamiento asignado.");
        
    }
    

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

//validacion formulario
function validaFormulario(){

    $( "#loadingGeneral").show();

    var v_correo = $('#antecedenteCorreo').val();
    if(v_correo == ""){
        showModalError("Modal-ups", "msjModal", "Estimado usuario, para revocar un estacionamiento, debe buscar por email los datos del colaborador.");
        $( "#loadingGeneral").hide();
        return false;
    }

    revocar();
    
    
}


//validacion formulario
async function revocar(){

   
    let l_usuarioEstacionamiento = JSON.parse(sessionStorage.getItem("l_usuarioEstacionamiento"));
    //let l_estacionamiento = JSON.parse(sessionStorage.getItem("l_estacionamiento"));

    let l_flgDeleteEst = deleteVehiculoByIdUsuarioEstacionamiento(l_usuarioEstacionamiento.ID);
    let l_flagadeleteUsrEst = deleteUsuarioEstacionamientoById(l_usuarioEstacionamiento.ID);

    $("#Modal-succes").modal("show");
   
    
}


$('#Modal-succes').on('hidden.bs.modal', function () {
    location.reload();
  })