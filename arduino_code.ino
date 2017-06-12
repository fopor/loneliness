/*This code is an arduino ESP8266WiFi code to processes simples inputs and *
 * call JavaScript functions through the ADA Fruit WEB API                                    */

#include <ESP8266WiFi.h>
#include "Adafruit_MQTT.h"
#include "Adafruit_MQTT_Client.h"

const int light_relay_pin = 16;
const int vibration_pin = 5;
int vibration_last = 0;

//WiFI
#define WIFI_SSID       "INSIRA AQUI O NOME DA REDE WI-FI"
#define WIFI_PASS       "INSIRA AQUI A SENHA DA REDE WI-FI"

//Adafruit IO
#define AIO_SERVER       "io.adafruit.com"
#define AIO_SERVERPORT   1883
#define AIO_USERNAME     fopor
#define AIO_KEY          07c9bb4794af4031a1de982206570012

//Get data to start conection with server through Wi-Fi network
WiFiClient client;
Adafruit_MQTT_Client mqtt(&client, AIO_SERVER, AIO_SERVERPORT, AIO_USERNAME, AIO_KEY);

//Set the in and out web feeds
//Adafruit_MQTT_Publish vibration = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/vibration");
//Adafruit_MQTT_Subscribe led = Adafruit_MQTT_Subscribe(&mqtt, AIO_USERNAME "/feeds/led");

//Sets the input "input-1", that is to be send to the WEB game
Adafruit_MQTT_Publish vibration = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/input1");

//Sets the output "light-relay" that will receibe the RELAY STATUS

//Do the conection to the server
void MQTT_connect();

void setup()
{
    //Sets the pin mode
    pinMode(led_pin, OUTPUT);

    //Starts the serial port to give the computer debug information at speed
    Serial.begin(115200);

    //Give serial feedback about connection starting
    Serial.print("Connecting to ");
    Serial.println(WIFI_SSID);

    //Waiting for Wi-Fi connection to be sucessfull
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    //Use serial port to give feedback about network connection
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
    
    //what does this do?
    mqtt.subscribe(&light_relay);
}

void loop() {
    //at every loop, connects to the Web API
    MQTT_connect();

    if(digitalRead(vibration_pin) == HIGH && vibration_last == 0)    {
        vibration.publish(1);
        Serial.println("Vibration HIGH");
        vibration_last = 1;
        delay(300);
    }

    if(digitalRead(vibration_pin) == LOW && vibration_last == 1)  {
        vibration.publish(0);
        Serial.println("Vibration LOW");
        vibration_last = 0;
        delay(300);
    }

    Adafruit_MQTT_Subscribe *subscription;
    while ((subscription = mqtt.readSubscription(100))) {
        if (subscription == &led)  {
            Serial.print("led: ");
            Serial.println((char *)led.lastread);
            
            if (strcmp((char *)led.lastread, "1") == 0) {
                digitalWrite(led_pin, HIGH);
            }
            
            if (strcmp((char *)led.lastread, "0") == 0) {
                digitalWrite(led_pin, LOW);
            }
        }
    }

} //end of the main loop

//Connectes the arduino to the web server
void MQTT_connect() {
    int8_t ret;

    if (mqtt.connected()){
        return;
    }

    Serial.print("Connecting to MQTT... ");

    uint8_t retries = 3;
    while ((ret = mqtt.connect()) != 0) {
        Serial.println(mqtt.connectErrorString(ret));
        Serial.println("Retrying MQTT connection in 5 seconds...");
        mqtt.disconnect();
        delay(5000);
        retries--;
        
        if (retries == 0) {
            while (1);
        }
    }
    
    Serial.println("MQTT Connected!");
}
