function getComboBoxEdificios(){
    $SP().list(GuidListEdificio[0]).get({
        orderby:"Nombre ASC",
        //where:'Clase <> "'+name+'"'
    }).then(function(data) {
        
        var row = "<label for='selectEdificio'>Edificio</label>" + 
                  "<select class='form-control' id='selectEdificio'>" + 
                  "<option value='0' selected>Seleccione...</option>";
        for (var i=0; i<data.length; i++){
            row = row + "<option value="+data[i].getAttribute("ID")+" >"+data[i].getAttribute("Nombre")+"</option>";
        }
        row = row + "</select>";
        
        $("#divSelectEdificio").html($("#divSelectEdificio").html() + row);

    });
}


function getRadioButtomEdificios(){
    $SP().list(GuidListEdificio[0]).get({
        orderby:"Nombre ASC",
        //where:'Clase <> "'+name+'"'
    }).then(function(data) {

        var row ="";
        for (var i=0; i<data.length; i++){
            row = row + "<div class='custom-control custom-radio custom-control-inline'>" + 
                  "<input type='radio' class='custom-control-input'  name='radEdificio' id='rad"+data[i].getAttribute("Nombre")+"' value='"+data[i].getAttribute("ID")+"'>" + 
                  "<label class='custom-control-label' for='rad"+data[i].getAttribute("Nombre")+"'>"+data[i].getAttribute("Nombre")+"</label>" +
                  "</div>";
        }

        $("#divRadioEdicifios").html($("#divRadioEdicifios").html() + row);

    });
}
