$(document).ready(function() {
    //sessionStorage.clear();
    getRadioButtomEdificiosListaPostulaciones();
    getCheckBoxTipoVehiculoListarPostulaciones();


    
    mostrarLoadingDosPadres("loadingTable");
    printTable(0, 0, 'Pendiente');
    
});



async function printTable(l_idEdificio, l_idTipoVehiculo, l_estado)
{   
    let listado = await getAllPostulacionesByEdificioyVehiculo(l_idEdificio, l_idTipoVehiculo, l_estado);
    let configLanguage = languagueDataTable();

    let tabla = "<table width='100%' cellpadding='6' cellspacing='0' id='tblListado' class='row-border'> "+
                    "<thead class='text-center text-table-head border-bottom'>"+
                        "<tr>"+

                            "<th scope='col' data-field='Posicion_Inicial' data-sortable='true'>Posición</th>"+
                            "<th scope='col' data-field='Nombre_Solicitante'>Nombre</th>"+
                            "<th scope='col' data-field='Fecha_Postulacion'>Fecha De Ingreso</th>"+
                            "<th scope='col' data-field='FK_NombreEdificio'>Edificio</th>"+
                            "<th scope='col' data-field='FK_NombreTipoVehiculo'>Tipo Vehículo</th>"+
                            

                        "</tr>"+
                    "</thead>"+
                    "<tbody class='text-center text-table border-bottom'>";
    for (let i=0; i < listado.length; i++){
        tabla += "<tr class='border-bottom'>"+
                    "<td>"+ listado[i].Posicion_Inicial +"</td>"+
                    "<td>"+ listado[i].Nombre_Solicitante +"</td>"+
                    "<td>"+ listado[i].Fecha_Postulacion +"</td>"+
                    "<td>"+ listado[i].FK_NombreEdificio +"</td>"+
                    "<td>"+ listado[i].FK_NombreTipoVehiculo +"</td>"+
                    
                    //"<td>"+ "<button class='btn btn-sm' type='button' onclick='eliminarMarca("+listado[i].ID+")'><i class='icon-Eliminar'></i></button></td>"+
                "</tr>";
    }
    tabla += "</tbody></table>";

    $("#divTabla").empty();   
    $("#divTabla").append(tabla);
    $('#tblListado').DataTable({
        "language": configLanguage,
        "scrollX": false,
        "searching": true,
        dom: 'lBfrtip',
        buttons: [
            {
                extend: 'print',
                text: 'Imprimir',
                className: "btn btn-outline-primary printBtnImprimir"
            },
            {
                extend: 'excel',
                text: 'Descargar excel',
                className: "btn btn-outline-primary printBtnExcel"
            } 
           /*  {
                extend: 'pdf',
                text: 'PDF',
                className: "btn btn-outline-primary printBtnExcel"
            }, */
            
        ]
        
    });

    $( "#loadingTable").hide();
}


function preparaLLamadoPrintTable(l_idTipoVehiculo){

    let l_idEdificio = $('input:radio[name=radEdificio]:checked').val();

    if(l_idEdificio == undefined)
    l_idEdificio = 0;


    printTable(l_idEdificio, l_idTipoVehiculo, 'Pendiente');

}