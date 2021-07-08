const urlEmployeeServices = 'https://ssffemployeesservices.azurewebsites.net/api/employee?';
const urlDateServer = 'https://ssffemployeesservices.azurewebsites.net/Api/Utilities';

var GuidListEdificio = ["{e07245fc-1fad-493a-9b17-6e068578e02b}","Edificio"];
var GuidListTipoVehiculo = ["{9252A2D1-0A6A-424A-9065-2982B343B30C}","Tipo_Vehiculo"];
//var GuidListPostulacion2 = ["{F8588D7E-1890-4A9D-869D-B42695204D49}","Postulacion2"];
var GuidListPostulacion = ["{19BB975E-9DC8-4E12-BB81-74F600A8DD3E}","Postulacion1"];
var GuidListVehiculo = ["{C84103D9-7259-491A-A532-06B18B8461B0}","Vehiculo"];
var GuidListMarca = ["{1F1709E6-722F-4827-A581-E044FED126FB}","Marca_Vehiculo"];
var GuidListModelo = ["{5854BCF8-F393-451C-85B4-3090DCD16F37}","Modelo_Vehiculo"];
var GuidListUsuarioEstacionamiento = ["{BD33545F-28F5-47E3-BF25-663045C7E039}","Usuario_Estacionamiento"];
var GuidListTipoVisita = ["{1042E7E8-235B-479F-BBF9-A78F1BA85A85}","Tipo_Visita"];
var GuidListVisita = ["{476BCA3F-50DE-4B90-86AD-E832A9CEF146}","Visita"];
var GuidListCategoriaEstacionamiento = ["{76BD1EF7-2939-48A0-96C7-E280E95F3B3B}","Categoria_Estacionamiento"];
var GuidListEstacionamiento = ["{CB60F759-2485-4BEF-83DE-C4DAA0508066}","Estacionamiento"];
var GuidListAgenda = ["{2D56D221-3C8F-4795-B6CE-1A9B6F45768E}","Agenda"];
var GuidListMotivoVisita = ["{00D50A17-4235-4FD8-B452-D8568247E69E}","Motivo_Visita"];
var GuidListModalGuiaVisita = ["{9B2E0B09-7B7D-42FF-975B-A4693D7A5332}","Mostrar_Modal_Tutorial_Reserva"];
var GuidListMenu = ["{092F646D-349C-430C-A852-94F767A1A36B}","Menu"];



function NewObjectMenu(){
	var oObject = {
		ID : 0,
		Title:'',
		class:'',
		padre:'',
		link:'',
		vigente:'',
		audiencia:'',
		Ordenamiento:'',
		ObjProperty : {
			ID : 'int',
			Title:'string',
			class:'string',
			padre:'string',
			link:'string',
			vigente:'bool',
			audiencia:'Person',
			Ordenamiento: 'int'
		}
	};
	return oObject;
}


function NewObjectEdificio(){
	var oObject = {
		ID : 0,
		Title:'',
        Nombre: '',
        Direccion: '',
        Activo: '',
		ObjProperty : {
			ID : 'int',
			Title:'string',
            Nombre: 'string',
            Direccion: 'string',
            Activo: 'string'
		}
	};
	return oObject;
}

function NewObjectTipoVehiculo(){
	var oObject = {
		ID : 0,
		Title:'',
        Nombre_Tipo: '',
		Caracteristicas: '',
		Activo: '',
		ObjProperty : {
			ID : 'int',
			Title:'string',
            Nombre_Tipo: 'string',
			Caracteristicas: 'string',
			Activo: 'string'
		}
	};
	return oObject;
}

function NewObjectVehiculo(){
	var oObject = {
		ID : 0,
		Title:'',
        Patente: '',
        Marca: 0,
        Modelo: 0,
        FK_Tipo_Vehiculo: 0,
		ObjProperty : {
			ID : 'int',
			Title:'string',
            Patente: 'string',
            Marca: 'int',
            Modelo: 'int',
            FK_Tipo_Vehiculo: 'int'
		}
	};
	return oObject;
}


function NewObjectPostulacion2(){
	var oObject = {
		ID : 0,
        Title:'',
        RUT:'',
        Fecha_Postulacion: '',
        Fecha_Asignacion: '',
        Observaciones: 0,
        FK_Vehiculo: 0,
        FK_Edificio: 0,
		ObjProperty : {
			ID : 'int',
            Title:'string',
            RUT:'string',
            Fecha_Postulacion: 'string',
            Fecha_Asignacion: 'string',
            Observaciones: 'string',
            FK_Vehiculo: 'int',
            FK_Edificio: 'int'
		}
	};
	return oObject;
}

function NewObjectPostulacion(){
	var postulcaion = {
		ID : 0,
        Title:'',
		RUT:'',
		Email:'',
		Telefono: '',
        Fecha_Postulacion: '',
		Fecha_Asignacion: '',
		Estado: '',
		Posicion_Inicial: 0, 
		FK_TipoVehiculo: 0,
		FK_Edificio: 0,
		Observaciones: 0,
		FK_NombreEdificio: '',
		FK_NombreTipoVehiculo: '',
		Nombre_Solicitante: '',
		ObjProperty : {
			ID : 'int',
            Title:'string',
			RUT:'string',
			Email:'string',
			Telefono: 'string',
            Fecha_Postulacion: 'string',
			Fecha_Asignacion: 'string',
			Estado: 'string',
			Posicion_Inicial: 'int', 
            Observaciones: 'string',
            FK_Vehiculo: 'int',
			FK_Edificio: 'int',
			FK_NombreEdificio: 'string',
			FK_NombreTipoVehiculo: 'string',
			Nombre_Solicitante: 'string'
		}
	};
	return postulcaion;
}



function NewObjectMarca(){
	var oObject = {
		ID : 0,
        Title:'',
        Nombre_Marca:'',
        FK_Tipo_Vehiculo: 0,
      	ObjProperty : {
			ID : 'int',
            Title:'string',
            Nombre_Marca:'string',
            FK_Tipo_Vehiculo: 'int'
		}
	};
	return oObject;
}


function NewObjectModelo(){
	var oObject = {
		ID : 0,
        Title:'',
        Nombre_Modelo:'',
        FK_Marca: 0,
      	ObjProperty : {
			ID : 'int',
            Title:'string',
            Nombre_Modelo:'string',
            FK_Marca: 'int'
		}
	};
	return oObject;
}


/*Objeto Usuario*/ 
function NewUsuario(){
	var usuario = {
		FullName : '',
        Email:'',
        Sociedad:'',
		Telefono: 0,
		RUT:'',
		Edicio:'',
		ObjProperty : {
			FullName : 'string',
			Email:'string',
			Sociedad:'string',
			Telefono: 'int',
			RUT:'string',
			Edicio:'string'
		}
      	
	};

	return usuario;
}

/*Objeto Fecha */
function NewFecha(){
	var fecha = {
		ID : 0,
		FechaString : '',
		FechaMoment : '',
		InicialDia:'',
		Estado:'',
		Clase:'',
		Horas: [],
		HorasEstado: [],
		Estacionamientos: []
	};

	return fecha;
}

function NewHoraFecha(){
	var Hora = {
		ID : 0,
		HoraInicio: 0,
		HoraFin: 0,
		Estado:'',
		Clase:'',
		ID_Fecha: 0,
		ID_Estaconamiento: 0

	};

	return Hora;
}

function newHoraEstado(){
	var HoraEstado = {
		ID : 0,
		HoraInicio: 0,
		Estado:'',
		Clase:'',
		ID_Fecha: 0
	};

	return HoraEstado;

}


function mapDias(){
	var map = new Map();
	map.set("Mon", "L");
	map.set("Tue", "M");
	map.set("Wed", "X");
	map.set("Thu", "J");
	map.set("Fri", "V");
	map.set("Sat", "S");
	map.set("Sun", "D");
	return map
}

function maphorasToPrintCalendario(){
	var mapHoras = new Map();
	mapHoras.set(0, "00 a 01:00 hrs");
	mapHoras.set(1, "01 a 02:00 hrs");
	mapHoras.set(2, "02 a 03:00 hrs");
	mapHoras.set(3, "03 a 04:00 hrs");
	mapHoras.set(4, "04 a 05:00 hrs");
	mapHoras.set(5, "05 a 06:00 hrs");
	mapHoras.set(6, "06 a 07:00 hrs");
	mapHoras.set(7, "07 a 08:00 hrs");
	mapHoras.set(8, "08 a 09:00 hrs");
	mapHoras.set(9, "09 a 10:00 hrs");
	mapHoras.set(10, "10 a 11:00 hrs");
	mapHoras.set(11, "11 a 12:00 hrs");
	mapHoras.set(12, "12 a 13:00 hrs");
	mapHoras.set(13, "13 a 14:00 hrs");
	mapHoras.set(14, "14 a 15:00 hrs");
	mapHoras.set(15, "15 a 16:00 hrs");
	mapHoras.set(16, "16 a 17:00 hrs");
	mapHoras.set(17, "17 a 18:00 hrs");
	mapHoras.set(18, "18 a 19:00 hrs");
	mapHoras.set(19, "19 a 20:00 hrs");
	mapHoras.set(20, "20 a 21:00 hrs");
	mapHoras.set(21, "21 a 22:00 hrs");
	mapHoras.set(22, "22 a 23:00 hrs");
	mapHoras.set(23, "23 a 24:00 hrs");

	return mapHoras
}


/*Objeto Estacionamiento*/ 
function NewEstacionamiento(){
	
	var estacionamiento = {
		ID : 0,
		Piso:0,
		Numero:0,
		FK_Edificio: 0,
		FK_Tipo_Vehiculo: 0,
		FK_CategoriaEstacionamiento: 0,
      	ObjProperty : {
			ID : 'int',
            Piso : 'int',
            Numero : 'int',
			FK_Edificio : 'int',
			FK_Tipo_Vehiculo : 'int',
			FK_CategoriaEstacionamiento : 'int'
		}
	};
      	
	return estacionamiento;
}

/*Objeto Agenda*/ 
function NewAgenda(){
	var agenda = {
		ID : '',
        FechaInicio:'',
        FechaFin:'',
		HoraInicio: 0,
		HoraFin: 0,
		FK_Estacionamiento: 0,
		FK_Visita: 0,
		ObjProperty : {
			ID : 'int',
            FechaInicio : 'string',
            FechaFin : 'string',
			HoraInicio : 'int',
			HoraFin : 'int',
			FK_CategoriaEstacionamiento : 'int',
			FK_Visita : 'int'
		}
      	
	};

	return agenda;
}



/*Objeto objeto visita*/ 
function NewVisita(){
	var visita = {
		ID : '',
		Nombre:'',
		Direccion: '',
        Rut:'',
		Correo: '',
		Telefono: 0,
		Sociedad: '',
		FK_TipoVisita: 0,
		FK_Edificio: 0,
		Patente : '',
		FK_MarcaVehiculo : 0,
		Motivo : '',
		Empresa : '',
		Correo_Solicitante : '',
		ObjProperty : {
			ID : 'int',
			Nombre : 'string',
			Direccion : 'string',
            Rut : 'string',
			Correo : 'string',
			Telefono : 'int',
			Sociedad : 'string',
			FK_TipoVisita : 'int',
			FK_Edificio : 'int',
			Patente : 'string',
			FK_MarcaVehiculo : 'int',
			Motivo : 'string',
			Empresa : 'string',
			Correo_Solicitante : 'string'
		}
      	
	};

	return visita;
}



/*Objeto objeto visita*/ 
function NewVisitaInterno(){
	var visitaInterno = {
		ID : 0,
        Nombre:'',
        RUT:'',
		Correo: 0,
		Telefono: 0,
		FK_TipoVisita: 0,
		FK_Edificio: 0
		
	};

	return visitaInterno;
}

function NewVisitaExterno(){
	var visitaInterno = {
		ID : 0,
        Nombre:'',
        Correo: 0,
		Telefono: 0,
		FK_TipoVisita: 0,
		FK_Edificio: 0,
		Patente : '',
		FK_Marca_Vehiculo : 0,
		Motivo : '',
		Empresa : ''
		
	};

	return visitaInterno;
}



function NewMotivoVisita(){
	var motivoVisita = {
		ID : 0,
        Motivo:'',
        FK_MotivoVisita: 0,
		ObjProperty : {
			ID : 'int',
			Nombre : 'string',
			FK_MotivoVisita : 'int'
		}
		
	};

	return motivoVisita;
}


function NewObjectVehiculo(){
	var vehiculo = {
		ID : 0,
		Patente: '',
		FK_Tipo_Vehiculo: '',
		FK_MarcaVehiculo:0,
		FK_UsuarioEstacionamiento:0,
		ObjProperty : {
			ID : 'int',
			Patente : 'string',
			FK_Tipo_Vehiculo: 'int',
			FK_MarcaVehiculo:'int',
			FK_UsuarioEstacionamiento:'int'
		}
	};
	return vehiculo;
}

function NewObjectEstacionamiento(){
	var estacionamiento = {
        ID : 0,
        Piso : '',
        Numero : '',
        Costo : '',
        FK_Edificio:0,
        FK_Tipo_Vehiculo:0,
        FK_CategoriaEstacionamiento:0,
        ObjProperty : {
            ID : 'int',
            Piso : 'string',
            Numero : 'string',
            Costo : 'string',
            FK_Edificio: 'int',
            FK_Tipo_Vehiculo: 'int',
            FK_CategoriaEstacionamiento: 'int'
            
		}
	};
	return estacionamiento;
}

function NewUsuarioEstacionamiento(){
	var usuarioEstacionamiento = {
        ID : 0,
        RUT : '',
        Nombre : '',
        Email : '',
        FK_Estacionamiento:0,
        ObjProperty : {
            ID : 'int',
            RUT : 'string',
            Nombre : 'string',
            Email : 'string',
            FK_Estacionamiento: 'int'
            
		}
	};
	return usuarioEstacionamiento;
}


function languagueDataTable(){
	var languague = {
			"sProcessing":    "Procesando...",
            "sLengthMenu":    "Mostrar _MENU_ registros",
            "sZeroRecords":   "No se encontraron resultados",
            "sEmptyTable":    "Ningún dato disponible en esta tabla",
            "sInfo":          "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            "sInfoEmpty":     "Mostrando registros del 0 al 0 de un total de 0 registros",
            "sInfoFiltered":  "(filtrado de un total de _MAX_ registros)",
            "sInfoPostFix":   "",
            "sSearch":        "Buscar:",
            "sUrl":           "",
            "sInfoThousands":  ",",
            "sLoadingRecords": "Cargando...",
            "oPaginate": {
                "sFirst":    "Primero",
                "sLast":    "Último",
                "sNext":    "Siguiente",
                "sPrevious": "Anterior"
            },
            "oAria": {
                "sSortAscending":  ": Activar para ordenar la columna de manera ascendente",
                "sSortDescending": ": Activar para ordenar la columna de manera descendente"
            }
        }

	return languague;
}