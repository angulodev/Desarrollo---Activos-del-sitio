async function getUsuarioEstacionamientoByEmail (v_Email) {

    //let l_objetcExiste = await existeMotivoByNombreMotivo(l_motivoVisita, l_tipoVisita);

    //if(!l_objetcExiste.flagExiste){
            return new Promise(resolve => {

                
                        $SP().list(GuidListUsuarioEstacionamiento[0]).get({
                            where: 'Email = "'+v_Email+'"'
                        }).then(function(items) {   
                            
                            

                            if(items.length == 0)
                                resolve(null); 

                            for (let i=0; i < items.length; i++){

                                var v_usuarioEstacionamiento = NewUsuarioEstacionamiento();
                                    
                                    v_usuarioEstacionamiento.ID = items[i].getAttribute("ID");
                                    v_usuarioEstacionamiento.RUT = items[i].getAttribute("RUT");
                                    v_usuarioEstacionamiento.Nombre = items[i].getAttribute("Nombre");
                                    v_usuarioEstacionamiento.Email = items[i].getAttribute("Email");
                                    v_usuarioEstacionamiento.FK_Estacionamiento = splitFunction(items[i].getAttribute("FK_Estacionamiento"), ";#", 0) ;
                                
                            }

                            resolve(v_usuarioEstacionamiento);
                        });
                
            });
   
}



async function deleteUsuarioEstacionamientoById(v_id) {

    return new Promise(resolve => {

        
        $SP().list(GuidListUsuarioEstacionamiento[0]).remove({
            where:"ID = " + v_id ,
            progress:function(current,max) {
                console.log(current+"/"+max);
                resolve(true);
          }});
        
    });

}
