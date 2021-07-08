
/* Para Reservar*/
$(document).ready(function() {
    $("input[type=radio]").click(function(event){
        var valor = $(event.target).val();
        if(valor =="interno"){
            $("#formularioInterno").show();
            $("#formularioExterno").hide();
        } else if (valor == "externo") {
            $("#formularioInterno").hide();
            $("#formularioExterno").show();
        } 
    });
});


