$(document).ready(function() {
    
    //getComboBoxMarcaVehiculosAsociarVehiculo(1);
    //GetDatosAntecedentes();
    getDatosEstacionamientos();
});

var l_countDivVehiculos =1;

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


async function getDatosEstacionamientos(){

    mostrarUnPadre('loadingPage');

    let l_email = await GetMail();
    let l_usuarioEstacionamiento = await  getUsuarioEstacionamientoByEmail(l_email);
    let l_estacionamiento = null;

    if(l_usuarioEstacionamiento != null){
        l_estacionamiento = await getEstacionamientoByID(l_usuarioEstacionamiento.FK_Estacionamiento);

        //set variables session
        sessionStorage.setItem("l_estacionamiento", JSON.stringify(l_estacionamiento));
        sessionStorage.setItem("l_usuarioEstacionamiento", JSON.stringify(l_usuarioEstacionamiento));
        
        GetDatosAntecedentesEstacionamiento(l_email, l_estacionamiento);
        var v_ready = await getComboBoxMarcaVehiculosAsociarVehiculo(l_estacionamiento.FK_Tipo_Vehiculo);
        printEstacionamientos();
    }
    else{
        $("#loadingPage").hide();
        $("#info-Modal").modal("show");
    }
    

}


async function printEstacionamientos(){

    let l_usuarioEstacionamiento = JSON.parse(sessionStorage.getItem("l_usuarioEstacionamiento"));
    let l_estacionamiento = JSON.parse(sessionStorage.getItem("l_estacionamiento"));

    let l_vehiculosArray = await getVehiculosByIdUsuarioEstacionamiento(l_usuarioEstacionamiento.ID);


    let l_numeroVehiculo = 0;
    for (var i = 0; i < l_vehiculosArray.length; i++){
        
        l_numeroVehiculo ++;
        $("#inputPatente"+l_numeroVehiculo).val(l_vehiculosArray[i].Patente).prop( "disabled", true );
        $("#selectMarca"+l_numeroVehiculo+" option[value="+l_vehiculosArray[i].FK_MarcaVehiculo+"]").attr("selected", true).prop( "disabled", true );
        $("#selectMarca"+l_numeroVehiculo).prop( "disabled", true );
        $("#idVehiculo"+l_numeroVehiculo).val(l_vehiculosArray[i].ID);
        $("#divBotonEliminar" +l_numeroVehiculo).show();
        


        if(i < l_vehiculosArray.length-1)
            addDivVehiculos(1);

    }

    console.log(JSON.stringify(l_vehiculosArray));
    //let l_arrayEstacionamientos = await GetMail();
    

}


function addDivVehiculos(idButton) {
    
    l_countDivVehiculos++;
    var Div2 = document.getElementById('Div2');
    var Div3 = document.getElementById('Div3');
    var Div4 = document.getElementById('Div4');
    var Div5 = document.getElementById('Div5');
    var btn = document.getElementById('divBotonAdd');
    
    console.log(l_countDivVehiculos)
    //clic = clic<5 ? clic : 1

    switch(l_countDivVehiculos) {
       case 2:
            Div2.style.display = 'block';
            Div3.style.display = 'none';
            Div4.style.display = 'none';
            Div5.style.display = 'none';
       
       
            break;

       case 3:
            Div2.style.display = 'block';
            Div3.style.display = 'block';
            Div4.style.display = 'none';
            Div5.style.display = 'none';
       
            break;

       case 4:
            Div2.style.display = 'block';
            Div3.style.display = 'block';
            Div4.style.display = 'block';
            Div5.style.display = 'none';
            
            
            break;

       case 5:
            Div2.style.display = 'block';
            Div3.style.display = 'block';
            Div4.style.display = 'block';
            Div5.style.display = 'block';
            btn.style.display = 'none';
            
            break;

   }

}



//validacion formulario
function validaFormulario(){

    $( "#loadingGeneral").show();
    let l_usuarioEstacionamiento = JSON.parse(sessionStorage.getItem("l_usuarioEstacionamiento"));
    let l_estacionamiento = JSON.parse(sessionStorage.getItem("l_estacionamiento"));


    //console.log("click: " + clic);
    let l_vehiculoArray = [];

    for(var i = 1; i <= l_countDivVehiculos ;i++){


        if(!$('#inputPatente'+i)[0].disabled){
                //alert ("El boton esta disabled: " +i);

                var v_patente = $('#inputPatente'+i).val();
                var v_selectMarca = $('#selectMarca'+i).val();
            
                /* if(v_patente == ""){
                    $( "#loadingGeneral").hide();
                    showModalError("Modal-ups", "msjModal", "Estimado usuario, debe ingresar la patente de su vehículo número: "+i+ ".");
                    return false;
                } */
                if(v_patente != "" && v_patente.length != 6){
                    $( "#loadingGeneral").hide();
                    showModalError("Modal-ups", "msjModal", "Estimado usuario, la patente de su vehículo número "+i+ " debe tener 6 carecteres.");
                    return false;
                }
                //validar funcionamiento
                if(v_patente == "" && v_selectMarca == 0){
                    $( "#loadingGeneral").hide();
                    showModalError("Modal-ups", "msjModal", "Estimado usuario, debe seleccionar la marca de su vehículo número: "+i+ ".");
                    return false;
                }
                
                //seteando variable vehiculo
                var v_vehiculo = NewObjectVehiculo();
                v_vehiculo.Patente =v_patente
                v_vehiculo.FK_Tipo_Vehiculo = l_estacionamiento.FK_Tipo_Vehiculo,
                v_vehiculo.FK_MarcaVehiculo = v_selectMarca;
                v_vehiculo.FK_UsuarioEstacionamiento = l_usuarioEstacionamiento.ID;
                
                //add list
                l_vehiculoArray.push(v_vehiculo);
        }
    }
  
    agregarVehiculos(l_vehiculoArray);
}




async function agregarVehiculos(l_vehiculoArray){
        
        for (var i = 0; i<l_vehiculoArray.length; i++){
             var v_vehiculo = await addVehiculo(l_vehiculoArray[i]);
             l_vehiculoArray[i] = v_vehiculo;
        }


        $( "#loadingGeneral").hide();
            $("#Modal-succes").modal("show");//location.reload();//location.href='asignacionVehiculo.aspx';
}


//Validando solo digitos en telefono
$(function(){

    $('.eliminar').click(function(e) {

        var boton = this.id;
        var idBoton = boton.charAt(boton.length-1);
        var v_idVehiculo = $("#idVehiculo"+idBoton).val();
        sessionStorage.setItem("idVehiculoToDelete", v_idVehiculo);
        //deleteVehiculo(v_idVehiculo);
        $("#Modal-confirm").modal("show");

        
      
    })
     
});

async function deleteVehiculo(){
    let l_idVehiculo = sessionStorage.getItem("idVehiculoToDelete");
    let l_flagDelete = await deleteVehiculoById(l_idVehiculo);
        
        if(l_flagDelete)  
            location.reload();//location.href='asignacionVehiculo.aspx';
}


$('#Modal-succes').on('hidden.bs.modal', function () {
    location.reload();
  })