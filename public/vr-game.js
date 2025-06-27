const socket = io();
let playerId = null;
let players = {};

const shootSound = document.getElementById("shoot-sound");
const explosionSound = document.getElementById("explosion-sound");

const player = document.getElementById("player");
const camera = document.getElementById("camera");

function shoot() {
  const position = player.object3D.position.clone();
  const direction = new THREE.Vector3();
  camera.object3D.getWorldDirection(direction);
  const projectile = document.createElement("a-sphere");
  projectile.setAttribute("position", position);
  projectile.setAttribute("radius", 0.1);
  projectile.setAttribute("color", "yellow");
  projectile.setAttribute("velocity", `${direction.x * 2} ${direction.y * 2} ${direction.z * 2}`);
  projectile.setAttribute("dynamic-body", "");
  document.querySelector("a-scene").appendChild(projectile);
  shootSound.play();
  socket.emit("shoot", { position, velocity: direction });
}

window.addEventListener("click", shoot);

setInterval(() => {
  const pos = player.object3D.position;
  socket.emit("move", { x: pos.x, y: pos.y, z: pos.z });
}, 100);

// Socket.io events
socket.on("init", data => {
  playerId = socket.id;
  players = data;
});

socket.on("player-joined", p => { players[p.id] = p; });
socket.on("player-left", id => { delete players[id]; });
socket.on("player-moved", p => { if (players[p.id]) players[p.id] = p; });

socket.on("player-shot", data => {
  const sphere = document.createElement("a-sphere");
  sphere.setAttribute("position", data.position);
  sphere.setAttribute("radius", 0.1);
  sphere.setAttribute("color", "red");
  document.querySelector("a-scene").appendChild(sphere);
  explosionSound.play();
});