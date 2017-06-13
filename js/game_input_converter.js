var url = 'wss://io.adafruit.com:443/mqtt/';
var username = 'fopor';
var aio_key  = '07c9bb4794af4031a1de982206570012';

var client = mqtt.connect(url, {
    username: username,
    password: aio_key
});

//Conects to the server to RECIVE information
client.on('connect', function() {
    console.log("MQTT Conectado!");
    client.subscribe(username + "/feeds/input");
});
  
client.on('error', function(e) {
    console.log(e);
});

function sendFeed(feed, valor) {
    client.publish(username + "/feeds/" + feed, valor);
    console.log("Enviado: " + username + "/feeds/" + feed + ": " + valor);
}

client.on('message', function(topic, message) {
    //Display debug information abou the input received
    console.log("Recebido: " + topic.toString() + ": " + message.toString());
    
    //If what is received is from input1
    if (topic.toString() == username + "/feeds/input") { 
        //gets the input value
        var input_value = parseInt(message);
        
        //sends the input value to the game
        processArduinoInput(input_value);

        //sends the STOP signal after a while
        setTimeout( send_stop, 521 );

    }

});

function send_stop(){
    processArduinoInput(0);
}


