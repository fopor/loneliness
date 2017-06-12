//This Script handles all the game audios
//if the game calls for an audio, this script waits for the previous sounds 
//to end before starting a new one

//loads all the sound files
var sadness_audio = new Audio('sounds/sadness.wav');
var back_music = new Audio ('sounds/back_music.wav');

//keeps the background music playing in loop
back_music.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);
back_music.play();

//sound efeccts at the end of the game
var audio_end_game = function (i){
    if( i == 1 ) {
        //stops the background music
        back_music.pause();

        //play sadness_audio
        sadness_audio.play();
    }

    //resets the background music
    if( i == 0){
        sadness_audio.pause();
        back_music.play();
    }
}

