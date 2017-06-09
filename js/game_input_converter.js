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
    client.subscribe(username + "/feeds/input1");
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
    if (topic.toString() == username + "/feeds/input1") { 
        //gets the input value
        var input_value = parseInt(message);
        if (input_value == 1) {
            console.log("Value Equals one!");
           
           //sends the input to the game
           processArduinoInput(1);
        
        } else {
            console.log("ValueDOES NOT Equals one!");
            console.log("sending the HALT comand to movement");
            processArduinoInput(0);
        }
    }

});