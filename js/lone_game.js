//Constants to control the game
const numberOfFriends = 3;


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
	speed: 512 // movement in pixels per second
};

//return the distance  between two objetcs
function distanceCalc (obj1, obj2) {
    return Math.sqrt((obj1.x - obj2.x)*(obj1.x - obj2.x) + (obj1.y - obj2.y)*(obj1.y - obj2.y));
}

//list of FRINDS (SIZE MUST MATCH OR BE GREATER THAN CONST numberOfFriends)
var friend= [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];

var friendCaught = 0;
var firstPlay = 0;
var mindSet = 1; //nominal mindset
var proxFlag = 0; //flag for proximity
var colisionDistance = 120; //DISTANCE TO CONSIDER COLISION

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
        friend[i].y = 100;
    }
    
    firstPlay = 1;
    }
    
    //function executed at COLISION
    else {
    if (player.x > canvas.width / 2 ) {
       player.x--;
    }
    
    else if (player.x < canvas.width / 2) {
       player.x++;
    }
    
    else if (player.y > canvas.height  - 120) {
        player.y--;
    }
    
    while (player.y <  canvas.height  - 120) {
    


        //one step per step
         player.y++;
        render();


    }
    
    }
    
};

// Update game objects
var update = function (modifier) {
	if (38 in keysDown) { // Player holding up
		player.y -= player.speed * modifier;
	}
	if (40 in keysDown) { // Player holding down
		player.y += player.speed * modifier;
	}
	
    //TO-DO is this game recibing X moviment??
    if (37 in keysDown) { // Player holding left
		player.x -= player.speed * modifier;
	}
    
	if (39 in keysDown) { // Player holding right
		player.x += player.speed * modifier;
	}

	// Are they touching?
    //check for proximity
    proxFlag = 0;
	for(i = 0; i < numberOfFriends; i++){
        if((friend[i].x <= player.x + colisionDistance) && (player.x <= friend[i].x + colisionDistance) &&
         (friend[i].y <= player.y + colisionDistance) && (player.y <= friend[i].y + colisionDistance)){
            proxFlag = 1;
        }
        
    }
    
    if( proxFlag == 1){
        ++friendCaught;
		reset();
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
    
	// Score
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Amigos assustados: " + friendCaught + "\ndist:" + distanceCalc(player, friend[0]), 400, 32);
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
reset();
main();
