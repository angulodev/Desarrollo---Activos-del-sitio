
/*Postuar estacinamiento*/
$('#submitPostular').on('click', function () {
  $('#Modal-ups').modal();
})


/*Reservar estacinamiento*/
$('#submitReservar').on('click', function () {
  $('#Modal-ups').modal();
})

/*Pasos para Reservar  estacinamiento*/
$( document ).ready(function() {
    $('#tipsModal').modal('toggle')
});


/*Asignar estacinamiento*/
$('#submitAsignacionV').on('click', function () {
  $('#Modal-ups').modal();
})


$('#submitAsignacionV').on('click', function () {
  $('#Modal-succes').modal();
})


/*Desvincular estacinamiento*/
$('#submitRevocarE').on('click', function () {
  $('#Modal-ups').modal();
})


$('#submitRevocarE').on('click', function () {
  $('#Modal-succes').modal();
})

/*Confirmar*/
$('#eliminarVehiculo').on('click', function () {
  $('#Modal-confirm').modal();
})


/*Modal informativo, usuario sin estacionamiento estacinamiento*/
$( document ).ready(function() {
    $('#info-Modal').modal('toggle')
});