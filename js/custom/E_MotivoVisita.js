function getComboBoxMotivoVisita(idTipoVisita, idComponente){
    
    $('#'+idComponente).empty();
    
    $SP().list(GuidListMotivoVisita[0]).get({
        orderby:"ID ASC",
        //where:'FK_TipoVisita = ' + idTipoVisita + ' AND ShowInComboBox = 1 ' 
        where:'ShowInComboBox = 1 AND FK_TipoVisita = ' + idTipoVisita
    }).then(function(data) {
        $('#'+idComponente).append('<option value="0">Seleccione... </option>');
        for (var i=0; i<data.length; i++){
            $('#'+idComponente).append('<option value="'+data[i].getAttribute("ID")+'">'+data[i].getAttribute("Motivo")+'</option>');
        }
    });


}




async function addMotivoOtro (l_motivoVisita, l_tipoVisita) {

    let l_objetcExiste = await existeMotivoByNombreMotivo(l_motivoVisita, l_tipoVisita);

    if(!l_objetcExiste.flagExiste){
            return new Promise(resolve => {

                
                        $SP().list(GuidListMotivoVisita[0]).add({
                        Motivo: l_motivoVisita.Motivo,
                        ShowInComboBox: 0, 
                        FK_TipoVisita: l_tipoVisita 
                        }).then(function(items) {   
                            if (items.failed.length > 0) {
                                for (let i=0; i < items.failed.length; i++) 
                                    console.log("Error al almacenar solicitud: '"+items.failed[i].errorMessage+"'  para tipo vehiculo :"+ l_tipoVehiculoID); // the 'errorMessage' attribute is added to the object
                                    $( "#loadingGeneral").hide();
                            }

                            for (let i=0; i < items.passed.length; i++){
                                l_motivoVisita.ID = items.passed[i].ID;
                            }

                            resolve(l_motivoVisita);
                        });
                
            });
    }
    else{
        l_motivoVisita.ID = l_objetcExiste.idMotivo;
        return l_motivoVisita;
    }
}



function existeMotivoByNombreMotivo(l_motivo, l_tipoVisita){
    
    let l_objetcExiste = {  flagExiste: false,
                            idMotivo: 0
                        }

    return new Promise(resolve => {

        $SP().list(GuidListMotivoVisita[0]).get({
            fields:"ID",
            where: 'Motivo = "'+l_motivo.Motivo+'"'
        }).then(function(data) {
            for (var i=0; i<data.length; i++){
                l_objetcExiste.flagExiste = true;
                l_objetcExiste.idMotivo = data[i].getAttribute("ID");
            }
            resolve(l_objetcExiste);
        });
    });


}