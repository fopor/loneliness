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

// Game objects
var player = {
	speed: 256 // movement in pixels per second
};
var friend = {};
var friendCaught = 0;
var firstPlay = 0;

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

	// Throw the monster somewhere on the screen randomly
	friend.x = 32 + (Math.random() * (canvas.width - 64));
	//monster.y = 32 + (Math.random() * (canvas.height - 64));
    friend.y = (canvas.height  - 200) - Math.random() *(canvas.height -200);
    
    firstPlay = 1;
    }
    
    else {
    if (player.x > canvas.width / 2 ) {
       player.x--;
    }
    
    else if (player.x < canvas.width / 2) {
       player.x++;
    }
    
    if (player.y > canvas.height  - 120) {
        player.y--;
    }
    
    else if (player.y <  canvas.height  - 120) {
        player.y++;
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
	if (37 in keysDown) { // Player holding left
		player.x -= player.speed * modifier;
	}
	if (39 in keysDown) { // Player holding right
		player.x += player.speed * modifier;
	}

	// Are they touching?
	if (
		player.x <= (friend.x + 32)
		&& friend.x <= (player.x + 32)
		&& player.y <= (friend.y + 32)
		&& friend.y <= (player.y + 32)
	) {
		++friendCaught;
		reset();
	}
};

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (playerReady) {
		ctx.drawImage(playerImage, player.x, player.y);
	}

	if (friendReady) {
		ctx.drawImage(friendImage, friend.x, friend.y);
	}

	// Score
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Amigos assustados: " + friendCaught, 400, 32);
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
