$SP().list("PersonasTest").get().then(function(data) {
    for (var i=0; i < data.length; i++) console.log(data[i].getAttribute("Nombre"));
  });