$(document).ready(function() {
    GetDatosAntecedentes();
    getRadioButtomEdificios();
    getCheckBoxTipoVehiculoVisita();
    
});

//Select tipo vehiculo invoca modelo vehiculo
$(function(){

    $('#selectMarca').change(function() {
        console.log('value marca: ' +$(this).val());
        getComboBoxModeloVehiculo($(this));
    });
});

//Select tipo moto invoca modelo moto
$(function(){

    $('#selectMoto').change(function() {
        console.log('value marca: ' +$(this).val());
        getComboBoxModeloMoto($(this));
    });
});


//Select tipo bicileta invoca modelo bicileta
$(function(){

    $('#selectBicileta').change(function() {
        console.log('value marca: ' +$(this).val());
        getComboBoxModeloBicicleta($(this));
    });
});

//Validando solo digitos en telefono
$(function(){

    $('#telefono').keypress(function(e) {
        if(event.charCode >= 48 && event.charCode <= 57 ){
            return true;
        }
        return false;   
    })
     
});

function habilitarEdit(){
    $( "#antecedenteNumero" ).prop( "readonly", false );
    $( "#antecedenteNumero" ).removeClass( "form-control-plaintext" ).addClass( "inp-edit" );

}

function mostrar(id){
    let loader = $("#"+id);
    loader.css("height", loader.parent().outerHeight());
    loader.css("width", loader.parent().outerWidth());
    loader.css("padding-top", loader.parent().outerHeight()/2 - loader.children().outerHeight()/2);
    loader.css("padding-left", loader.parent().outerWidth()/2 - loader.children().outerWidth()/2);
    loader.show();
}