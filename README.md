# loneliness
Rereading of the game Loneliness, a Jordan Magnuson indie game about solitude, adapted for arduino-based human interaction

This program receives inputs from an arduino, utilizing the Adafruit WEB API.

The game objects (player sprite, "virtual-friend-sprite" and background) are supposed to react to three different inputs:

the movement of the player, which is read by an gesture sensor, 

a proximity sensor, which will be placed near the player,

and a luminosity sensor, which will detect if the enviroment light is on,

The sensors will define the "mood" (state) of the virutal-friend-sprite.



All the sprites will avoid the player in all "moods": scared, nominal and angry.

Mood choice:

Angry: triggered if the player stand too close (proximity sensor) to the system;

Scared: triggered if the player turns the light off;

Nominal: triggered at the beginning of the game;



The game can only support one "mood" at a time, if there are sufficient conditions for more than one mood, only the most "intense" will be selected, in the order:

Angry > Scared > Nominal;



Behavior of the "virtual-friend-sprite":

Angry: shaking, sprite change to a red color

Scared: color start to fade (similar to the background color), avoids the player at a greater distance

Nominal: avoids the player only when he is too close to them, at a slow pace
