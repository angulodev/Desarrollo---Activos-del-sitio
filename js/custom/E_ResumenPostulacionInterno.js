$(document).ready(function() {
    showAntecedentes();

    var mapTipoVehiculoGuardar = new Map(JSON.parse(sessionStorage.getItem("mapTipoVehiculoGuardar")));
    var mapTipoVehiculos = new Map(JSON.parse(sessionStorage.getItem("mapTipoVehiculos")));
    var mapContadorInicial = new Map(JSON.parse(sessionStorage.getItem("mapContadorInicial")));
    
    let edificioPostulacion = NewObjectEdificio();
    edificioPostulacion =  JSON.parse(sessionStorage.getItem("edificioPostulacion"));
  /*
    let msjPosicion = '';
     
    mapTipoVehiculoGuardar.forEach(function(valor, clave, mapTipoVehiculoGuardar) {
        msjPosicion += "<div>"
        msjPosicion += "Tu posición actual en la lista de espera para " + mapTipoVehiculos.get(clave)+" en " +edificioPostulacion.Nombre + " es : " + mapContadorInicial .get(clave)
        msjPosicion += "</div>"
      })

      $("#resumenPosicion").html( msjPosicion);     */
});

