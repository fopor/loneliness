//Constants to control the game
const numberOfFriends = 3;
const ScaredColisionDistance = 250;
const AngryColisionDistance = 250;
const NormalColisionDistance = 250;
const friendYSize = 32;
const friendXSize = 32;
const playerXSize = 120;
const playerYSize = 120;
const DEBBUG = 0;


// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1800;
canvas.height = 900;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/bkg.png";

// ending image
var endReady = false;
var endImage = new Image();
endImage.onload = function () {
	endReady = true;
};
endImage.src = "images/end.png";

//all alone after-game image
var allAloneReady = false;
var allAloneImage = new Image();
allAloneImage.onload = function () {
	allAloneReady = true;
};
allAloneImage.src = "images/all_alone.png";

// Player_happy sprite
var playerReady = false;
var playerImage = new Image();
playerImage.onload = function () {
	playerReady = true;
};
playerImage.src = "images/player_happy.png";

// Player_neutral sprite
var playerNeutralReady = false;
var playerNeutralImage = new Image();
playerNeutralImage.onload = function () {
	playerNeutralReady = true;
};
playerNeutralImage.src = "images/player_neutral.png";

// Player_sad sprite
var playerSadReady = false;
var playerSadImage = new Image();
playerSadImage.onload = function () {
	playerSadReady = true;
};
playerSadImage.src = "images/player_sad.png";

// Player_very_sad sprite
var playerVerySadReady = false;
var playerVerySadImage = new Image();
playerVerySadImage.onload = function () {
	playerVerySadReady = true;
};
playerVerySadImage.src = "images/player_very_sad.png";

// friend image
var friendReady = false;
var friendImage = new Image();
friendImage.onload = function () {
	friendReady = true;
};
friendImage.src = "images/amigo_base.png";

// friend-Angry sprite
var friendAngryReady = false;
var friendAngryImage = new Image();
friendAngryImage.onload = function () {
	friendAngryReady = true;
};
friendAngryImage.src = "images/amigo_irritado.png";

// friend-Scared sprite
var friendScaredReady = false;
var friendScaredImage = new Image();
friendScaredImage.onload = function () {
	friendScaredReady = true;
};
friendScaredImage.src = "images/amigo_assustado.png";

// Game objects
var player = {
	speed: 400 // movement in pixels per second
};

//return the distance  between two objetcs
function distanceCalc (obj1, obj2) {
    return Math.sqrt((obj1.x - obj2.x)*(obj1.x - obj2.x) + (obj1.y - obj2.y)*(obj1.y - obj2.y));
}

//list of FRINDS (SIZE MUST MATCH OR BE GREATER THAN CONST numberOfFriends)
var friend= [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];

var mindSet = 0; //nominal mindset
var proxFlag = 0; //flag for proximity
var colisionDistance = NormalColisionDistance; //DISTANCE TO CONSIDER COLISION
var colisionID = 0; //stores the block witch colided
var runAwaySpeed = 1; //SPEED USED TO RUN AWAY
var playerBorderColision = 0; //flag for border colision
var friendBorderColision = 0; //flag for border colision
var playerhappiness = 35000;  //this number is slowly reduced, and the game ends when its reachs zero
var playerState = 4; //defines the player mood

//This flag tells the render that it is time to render the ending animation
var end_game = 0;

//Handle the arduino input
var ardInput = {};

//Process the input - to be called every cicle
var processArduinoInput = function (input){
    console.log("Receving arduino update. Code: " + input);

    //"UP" input
    if(input == 1){
        ardInput.up=1;
        ardInput.down = 0;
        ardInput.left = 0;
        ardInput.right = 0;
        ardInput.prox = 0;
        Ardinput.lumiSensor = 0;
    }
    
    //the null input from arduino
    else {
        ardInput.up = 0;
        ardInput.down = 0;
        ardInput.left = 0;
        ardInput.right = 0;
        ardInput.prox = 0;
        Ardinput.lumiSensor = 0;
    }
};

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Reset the game when the player catches a monster
var reset = function () {
    player.x = canvas.width / 2;
    player.y = canvas.height  - 120;

    // Throw the friends somewhere on the screen 
    for(i = 0; i < numberOfFriends; i++){
        friend[i].x = 128 + (canvas.width)*(i/(numberOfFriends));
        
        //TO-DO add random factor here
        friend[i].y = 100+ Math.random()*60;
    }

    mindSet = 0; //resets mind set
    proxFlag = 0; //flag for proximity
    colisionDistance = NormalColisionDistance; //resets colision distance
    playerhappiness = 35000;  //resets the hapiness counter
    playerState = 4; // resets the mood

    //resets the render alpha
    ctx.globalAlpha = 1;

    //resets the audio
    audio_handler(0);  

    //resets the end game flag
    end_game = 0;
};

var softColision = function () {
    //function executed at Proximity Alert
    //make friend avoid the player
    if(friend[colisionID].x > player.x){
        friend[colisionID].x += runAwaySpeed;
    }
    
    else if (friend[colisionID].x < player.x) {
        friend[colisionID].x -= runAwaySpeed;
    }
    
    if(friend[colisionID].y > player.y){
        friend[colisionID].y += runAwaySpeed;
    }
    
    else if (friend[colisionID].y < player.y) {
        friend[colisionID].y -= runAwaySpeed;
    }
}

//moves  the player 1 step closer to center
var movePlayerToCenter = function () {
    if(player.x > canvas.width/2) {
        player.x--;
    }
    
    else if(player.x < canvas.width/2){
        player.x++;
    }
    
    if(player.y >= playerYSize){
        player.y++;
    }
}

 //move friends to StandardPosition (at y = 200 and x = i/numberOfFriends)
 var moveFriendsBack = function () {
    //takes every friend, one by one, back to its StandardPosition
    for(i = 0; i < numberOfFriends; i++){
        if(friend[i].y < 150){
            friend[i].y += runAwaySpeed;
        }
        
        else if(friend[i].y > 150) {
            friend[i].y -= runAwaySpeed;
        }
        
        if(friend[i].x > i*canvas.width/numberOfFriends + friendXSize){
            friend[i].x -= runAwaySpeed;
        }
        
        else if (friend[i].x < i*canvas.width/numberOfFriends+ friendXSize) {
            friend[i].x += runAwaySpeed;
        }
    }
 }

//re-arranje all objetcs
var reCenter = function() {
    //player is moved in direction to center
    movePlayerToCenter();
    
    //move friends to StandardPosition (at y = 200 and x = i/numberOfFriends)
    moveFriendsBack();
}

// Update game objects
var update = function (modifier) {
    //check for the RESET keyCode
    if(82 in keysDown) {
        console.log("Receving RESET signal!");
        
        reset();
    }

    //updates the player mood
    if(playerhappiness  < 30000){
        playerState = 3;
    }
    
    if(playerhappiness  < 10000){
        playerState = 2;
    }
    
    if(playerhappiness  < 5000){
        playerState = 1;
    }


    //process the MOOD INPUTS
    if (65 in keysDown) { // Player pushs 'A'
            //start SCARED MODE
            colisionDistance = ScaredColisionDistance;
            runAwaySpeed = 5;
            mindSet = 1;
        }
        
    if (83 in keysDown) { // Player pushs 'S'
            //start ANGRY MODE
            colisionDistance = AngryColisionDistance;
            runAwaySpeed = 30;
            mindSet = 2;
        }
        
    if (68 in keysDown) { // Player pushs 'D'
            //start NOMINAL MODE
            colisionDistance = NormalColisionDistance;
            runAwaySpeed = 1;
            mindSet = 0;
        }

    //are friends touching BORDERS?
    //resets the colision flag
    friendBorderColision = 0;
    
    //check for border colision for all friends
    for(i = 0; i < numberOfFriends; i++){
        if(friend[i].x + friendXSize >= canvas.width+350) {
            friendBorderColision = 1;
        }
        
        //dont move past the left wall
        if(friend[i].x <= -350){
            friendBorderColision = 1;
        }
        
        //dont pass the ceiling
        if(friend[i].y <= -350){
             friendBorderColision = 1;
        }
        
        //dont move past the floor
        if(friend[i].y + friendYSize >= canvas.height+350) {
            friendBorderColision = 1;
        }
    }
    
    if(friendBorderColision == 1){
        playerhappiness -= 100;
    }
    
    //is the player touching the BORDERS?
    //resets the colision flag
    playerBorderColision = 0;
    
    //dont move past the right wall
    if(player.x + playerXSize >= canvas.width) {
        playerBorderColision = 1;
        player.x -= 1;
    }
    
    //dont move past the left wall
    if(player.x <= 0){
        playerBorderColision = 1;
        player.x += 1;
    }
    
    //dont pass the ceiling
    if(player.y <= 0){
        playerBorderColision = 1;
        player.y += 1;
    }
    
    //dont move past the floor
    if(player.y + playerYSize >= canvas.height) {
        playerBorderColision = 1;
        player.y -= 1;
    }
    
	// Are they touching?
    //check for proximity
    proxFlag = 0;
	for(i = 0; i < numberOfFriends; i++){
        //check if DISTANDCE < COLISION DISTANCE with each object
        if(distanceCalc(player, friend[i]) < colisionDistance){
            colisionID = i;
            proxFlag = 1;
        }   
    }
    
    //if friends are TOUCHING THE BORDER, solve this
    if(friendBorderColision == 1){
        reCenter();
    }
    
    //Process the MOVE INPUTS
    if(proxFlag == 0 && playerBorderColision == 0 && friendBorderColision == 0){
        if (38 in keysDown || ardInput.up == 1) { // Player holding up
            player.y -= player.speed * modifier;
        }

        if (40 in keysDown) { // Player holding down
            player.y += player.speed * modifier ;
        }
        
        if (37 in keysDown) { // Player holding left
            player.x -= player.speed * modifier;
        }
        
        if (39 in keysDown) { // Player holding right
            player.x += player.speed * modifier;
        }
    }
    
    //colision between friend and player
    if( proxFlag == 1 && friendBorderColision == 0){
		softColision();
    }
};

// Draw everything - roda todo ciclo
var render = function () {
    if(end_game == 0){
       ctx.globalAlpha = playerhappiness / 15000;
    }
    
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (playerReady && playerState == 4) {
		ctx.drawImage(playerImage, player.x, player.y);
	}
    
    if (playerNeutralReady && playerState == 3) {
		ctx.drawImage(playerNeutralImage, player.x, player.y);
	}
    
    if (playerSadReady && playerState == 2){
        ctx.drawImage(playerSadImage, player.x, player.y);
    }
    
    if(playerVerySadReady && playerState == 1){
        ctx.drawImage(playerVerySadImage, player.x,player.y);
    }

    //draws all the friends
    //draws the nominal friend
	if (friendReady &&  mindSet == 0) {
        for(i = 0; i < numberOfFriends; i++){
            ctx.drawImage(friendImage, friend[i].x, friend[i].y);
        }
	}
    
    //draws the scared friend
	else if (friendScaredReady &&  mindSet == 1) {
        for(i = 0; i < numberOfFriends; i++){
            ctx.drawImage(friendScaredImage, friend[i].x, friend[i].y);
        }
	}
    
    //draws the angry friend
	else if (friendAngryReady &&  mindSet == 2) {
        for(i = 0; i < numberOfFriends; i++){
            ctx.drawImage(friendAngryImage, friend[i].x, friend[i].y);
        }
    }
	
    
    if (end_game == 1){
        
        aux_alpha = ctx.globalAlpha;
        ctx.drawImage(endImage, 0, 0);
        ctx.globalAlpha = aux_alpha + 0.005;
        console.log(ctx.globalAlpha);
        //TODO WHEN ALHPA GETS TO 0, SHOW THE PLAYER ALL ALONE AND RESTART
        
        if(ctx.globalAlpha > 0.9944){
                ctx.drawImage(allAloneImage, 0, 0);
                
                //ADD LOGIC TO RESET GAME
                cosole.log("trying to draw ending pic");
        }
    }
    
	// information for DEBBUGIN
    if(DEBBUG == 1){
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
    for(i = 0; i < numberOfFriends; i++) {
        ctx.fillText("dist_" + i + ":" + distanceCalc(player, friend[i]), 400, 32*i);
    }
    
    ctx.fillText("player_pos: x="  + player.x + "  y=" + player.y, 400, 32*i);
    ctx.fillText("friend_col_flag: " + friendBorderColision, 400, 32*(i+1));
    ctx.fillText("Player_Happniess: " + playerhappiness, 400, 32*(i+2));
    ctx.fillText("PlayerState: " + playerState, 400, 32*(i+3));
    }
    
    //This block was originally at the MAIN function, but we must put it here
    //TODO Check if this cause instability
	// Request to do this again ASAP
	requestAnimationFrame(main);
};

//the audio handler re-call function
var audio_handler = function (i) {

    audio_end_game(i);

}

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

    update (delta/1000);
	render();
    playerhappiness -= 1;
    
	//hapiness more drained if we are angry
    if(mindSet == 1){
        playerhappiness -= 3;
    }
   
    if(mindSet == 2){
        playerhappiness -= 20;
    }
	
	then = now;
	
	//TODO: End game function
    if(playerhappiness < 0){
        //TODO add ending logic
        end_game = 1;
        
        //Reproduce the end game audio
        audio_handler(1);


        //restart the game    
        //actually do not
        

    }
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
reset();
main();
