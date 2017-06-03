//Constants to control the game
const numberOfFriends = 4;
const friendYSize = 120;
const friendXSize = 120;
const playerXSize = 120;
const playerYSize = 120;
const DEBBUG = 1;


// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1152;
canvas.height = 648;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/bkg.png";

// Player sprite
var playerReady = false;
var playerImage = new Image();
playerImage.onload = function () {
	playerReady = true;
};
playerImage.src = "images/player.png";

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

var friendCaught = 0;
var firstPlay = 0;
var mindSet = 0; //nominal mindset
var proxFlag = 0; //flag for proximity
var colisionDistance = 200; //DISTANCE TO CONSIDER COLISION
var colisionID = 0; //stores the block witch colided
var runAwaySpeed = 1; //SPEED USED TO RUN AWAY
var playerBorderColision = 0; //flag for border colision
var friendBorderColision = 0; //flag for border colision
var playerhappiness = 50000;

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
if (firstPlay == 0){
	player.x = canvas.width / 2;
	player.y = canvas.height  - 120;

	// Throw the friends somewhere on the screen 
    for(i = 0; i < numberOfFriends; i++){
        friend[i].x = 128 + (canvas.width)*(i/(numberOfFriends));
        
        //TO-DO add random factor here
        friend[i].y = 100+ Math.random()*60;
    }
    
    firstPlay = 1;
    }
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
    //process the MOOD INPUTS
    if (65 in keysDown) { // Player pushs 'A'
            //start SCARED MODE
            colisionDistance = 250;
            runAwaySpeed = 5;
            mindSet = 1;
        }
        
    if (83 in keysDown) { // Player pushs 'S'
            //start ANGRY MODE
            colisionDistance = 120;
            runAwaySpeed = 30;
            mindSet = 2;
        }
        
    if (68 in keysDown) { // Player pushs 'D'
            //start NOMINAL MODE
            colisionDistance = 200;
            runAwaySpeed = 1;
            mindSet = 0;
        }

    //are friends touching BORDERS?
    //resets the colision flag
    friendBorderColision = 0;
    
    //check for border colision for all friends
    for(i = 0; i < numberOfFriends; i++){
        if(friend[i].x + friendXSize >= canvas.width) {
            friendBorderColision = 1;
        }
        
        //dont move past the left wall
        if(friend[i].x <= 0){
            friendBorderColision = 1;
        }
        
        //dont pass the ceiling
        if(friend[i].y <= 0){
             friendBorderColision = 1;
        }
        
        //dont move past the floor
        if(friend[i].y + friendYSize >= canvas.height) {
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
        if (38 in keysDown) { // Player holding up
            player.y -= player.speed * modifier;
        }

        if (40 in keysDown) { // Player holding down
            player.y += player.speed * modifier;
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
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (playerReady) {
		ctx.drawImage(playerImage, player.x, player.y);
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
    }
    
    //This block was originally at the MAIN function, but we must put it here
    //TODO Check if this cause instability
	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

    update (delta/1000);
	render();
    playerhappiness -= 1;
    
    if(mindSet == 1){
        playerhappiness -= 3;
    }
    
    if(mindSet == 2){
        playerhappiness -= 20;
    }

	then = now;
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
reset();
main();
