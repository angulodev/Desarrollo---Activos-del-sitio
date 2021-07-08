async function addNoMostrarMas () {

    let l_email = await GetMail();
    
    return new Promise(resolve => {
        
                $SP().list(GuidListModalGuiaVisita[0]).add({
                Email: l_email,
                No_Mostrar: 1
                }).then(function(items) {   
                    if (items.failed.length > 0) {
                        for (let i=0; i < items.failed.length; i++) 
                            console.log("Error al almacenar solicitud: '"+items.failed[i].errorMessage+"'  para tipo vehiculo :"+ l_tipoVehiculoID); // the 'errorMessage' attribute is added to the object
                    }

                    for (let i=0; i < items.passed.length; i++){
                        resolve(true);
                    }

                    resolve(false);
                });
        
    });

}



async function existeNoMostrarMas(){
    
    let l_email = await GetMail();
    let l_existe = false;

    return new Promise(resolve => {

        $SP().list(GuidListModalGuiaVisita[0]).get({
            fields:"ID",
            where: 'Email = "'+l_email+'"'
        }).then(function(data) {
            for (var i=0; i<data.length; i++){
               //data[i].getAttribute("ID");
               l_existe = true;
            }
            resolve(l_existe);
        });
    });


}