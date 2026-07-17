import GAME_CONFIG from './config.js';
import AudioEngine from './audio.js';

// Setup Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Virtual Resolution
const V_WIDTH = 900;
const V_HEIGHT = 500;

// Game State
let isPlaying = false;
let gameTime = 0;
let cameraX = 0;
let activeLocation = null;
let isUIOpen = false;
let hasEnteredCastle = false;
let isSunsetTriggered = false;
let isNightTriggered = false;
let weatherState = 'sunny'; // 'sunny', 'raining'
let weatherTimer = 180; // switch weather every few hundred frames

// Particle Arrays
const petals = [];
const fireflies = [];
const stars = [];
const raindrops = [];
const ripples = [];
const sparkles = [];
const clouds = [];

// Input state
const keys = {
  left: false,
  right: false,
  up: false,
  down: false,
  interact: false
};

// Clear all inputs when dialog/UI opens
function clearInputs() {
  keys.left = false;
  keys.right = false;
  keys.up = false;
  keys.down = false;
  keys.interact = false;
  player.vx = 0;
  player.vy = 0;
  player.state = 'idle';
}

// World Locations x-coordinates
const LOCATIONS = [
  { id: 1, x: 800, name: "since you love daisies", interacted: false },
  { id: 2, x: 1900, name: "and catsss", interacted: false },
  { id: 3, x: 3100, name: "our small pink house", interacted: false },
  { id: 4, x: 4400, name: "giant pink castle", interacted: false }
];

// NPC entities
const cats = [
  { x: 740, y: 395, frame: 0, waveTimer: 0, direction: 1, name: "Cottage Cat" },
  { x: 1820, y: 395, frame: 0, waveTimer: 0, direction: 1, name: "Cafe Cat 1" },
  { x: 2000, y: 395, frame: 0, waveTimer: 0, direction: -1, name: "Cafe Cat 2" },
  { x: 3020, y: 395, frame: 0, waveTimer: 0, direction: 1, name: "Scroll Cat 1" },
  { x: 3220, y: 395, frame: 0, waveTimer: 0, direction: -1, name: "Scroll Cat 2" }
];

const butterflies = [
  { x: 400, y: 250, vx: 0.5, vy: 0.2, color: '#f3a6c8', hoverTimer: 0, msgIndex: 0 },
  { x: 1100, y: 200, vx: -0.4, vy: 0.3, color: '#bdecb6', hoverTimer: 0, msgIndex: 1 },
  { x: 1500, y: 280, vx: 0.6, vy: -0.2, color: '#aec6cf', hoverTimer: 0, msgIndex: 2 },
  { x: 2400, y: 220, vx: 0.3, vy: 0.4, color: '#ffb7b2', hoverTimer: 0, msgIndex: 3 },
  { x: 2800, y: 180, vx: -0.5, vy: -0.3, color: '#e8aeff', hoverTimer: 0, msgIndex: 4 },
  { x: 3600, y: 260, vx: 0.4, vy: 0.1, color: '#ffd1dc', hoverTimer: 0, msgIndex: 5 },
  { x: 4000, y: 240, vx: 0.2, vy: -0.4, color: '#ffe5ec', hoverTimer: 0, msgIndex: 0 }
];

const bunny = {
  x: 1300,
  y: 390,
  vx: 0,
  vy: 0,
  frame: 0,
  state: 'idle', // 'idle', 'running'
  direction: 1
};

// Player (Princess) Definition
const player = {
  x: 100,
  y: 330,
  width: 32,
  height: 50,
  vx: 0,
  vy: 0,
  speed: 4.5,
  jumpStrength: -11,
  gravity: 0.5,
  isGrounded: false,
  state: 'idle', // 'idle', 'walking', 'jumping', 'crouching'
  direction: 1, // 1 = right, -1 = left
  animFrame: 0,
  animTimer: 0,
  isJumping: false,
  isCrouching: false
};

// Auto-scale canvas responsively
function resizeCanvas() {
  const container = document.getElementById('game-container');
  const windowWidth = container.clientWidth;
  const windowHeight = container.clientHeight;

  const scaleX = windowWidth / V_WIDTH;
  const scaleY = windowHeight / V_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  canvas.width = V_WIDTH * scale;
  canvas.height = V_HEIGHT * scale;
  ctx.imageSmoothingEnabled = false;
  ctx.scale(scale, scale);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Initial Setup of Particles
function initParticles() {
  // Clouds
  for (let i = 0; i < 6; i++) {
    clouds.push({
      x: Math.random() * V_WIDTH * 5,
      y: 30 + Math.random() * 80,
      speed: 0.1 + Math.random() * 0.15,
      size: 40 + Math.random() * 40
    });
  }
  // Stars (initially hidden, appear at sunset/night)
  for (let i = 0; i < 40; i++) {
    stars.push({
      x: Math.random() * V_WIDTH,
      y: Math.random() * 220,
      alpha: 0,
      sparkleSpeed: 0.02 + Math.random() * 0.03
    });
  }
}

// ----------------------------------------------------
// PIXEL-ART DRAWING UTILITIES
// ----------------------------------------------------

function drawPixelCottage(cCtx, x, y) {
  // Main cottage body
  cCtx.fillStyle = '#ffb3ba'; // Pastel Pink
  cCtx.fillRect(x, y - 90, 110, 90);
  
  // Wooden frame/pillars
  cCtx.fillStyle = '#8d6e63';
  cCtx.fillRect(x, y - 90, 8, 90);
  cCtx.fillRect(x + 102, y - 90, 8, 90);
  
  // Roof (Brown/Cozy dark)
  cCtx.fillStyle = '#5d4037';
  cCtx.beginPath();
  cCtx.moveTo(x - 15, y - 90);
  cCtx.lineTo(x + 55, y - 130);
  cCtx.lineTo(x + 125, y - 90);
  cCtx.fill();

  // Roof border
  cCtx.fillStyle = '#8d6e63';
  cCtx.fillRect(x - 15, y - 93, 140, 5);

  // Door
  cCtx.fillStyle = '#ff7597';
  cCtx.fillRect(x + 40, y - 55, 30, 55);
  cCtx.fillStyle = '#ffe5ec';
  cCtx.fillRect(x + 43, y - 52, 24, 20); // Window on door
  
  // Heart details on cottage wall
  cCtx.fillStyle = '#ff4081';
  cCtx.fillRect(x + 18, y - 50, 4, 4);
  cCtx.fillRect(x + 22, y - 50, 4, 4);
  cCtx.fillRect(x + 20, y - 48, 4, 4);

  // Daisies around cottage
  for (let i = 0; i < 8; i++) {
    const dx = x - 20 + i * 20;
    if (i !== 3 && i !== 4) { // don't block the door
      cCtx.fillStyle = '#c8e6c9'; // stem
      cCtx.fillRect(dx + 5, y - 10, 2, 10);
      cCtx.fillStyle = '#fff'; // petals
      cCtx.fillRect(dx + 3, y - 14, 6, 2);
      cCtx.fillRect(dx + 5, y - 16, 2, 6);
      cCtx.fillStyle = '#ffd54f'; // center
      cCtx.fillRect(dx + 5, y - 13, 2, 2);
    }
  }

  // Glowing door outline
  cCtx.strokeStyle = 'rgba(255, 235, 59, ' + (0.3 + Math.abs(Math.sin(gameTime / 15)) * 0.5) + ')';
  cCtx.lineWidth = 4;
  cCtx.strokeRect(x + 39, y - 56, 32, 57);
}

function drawCozyHouse(cCtx, x, y) {
  // Cozy small house w cats
  cCtx.fillStyle = '#b3e5fc'; // Pastel base
  cCtx.fillRect(x, y - 90, 120, 90);

  // Wooden accents
  cCtx.fillStyle = '#6d4c41';
  cCtx.fillRect(x, y - 90, 120, 8);

  // Roof
  cCtx.fillStyle = '#795548';
  cCtx.beginPath();
  cCtx.moveTo(x - 10, y - 90);
  cCtx.lineTo(x + 60, y - 135);
  cCtx.lineTo(x + 130, y - 90);
  cCtx.fill();

  // Glass Window
  cCtx.fillStyle = '#e0f7fa';
  cCtx.fillRect(x + 15, y - 60, 30, 30);
  cCtx.fillStyle = '#ffffff';
  cCtx.fillRect(x + 28, y - 60, 2, 30);
  cCtx.fillRect(x + 15, y - 46, 30, 2);

  // Door
  cCtx.fillStyle = '#a1887f';
  cCtx.fillRect(x + 75, y - 60, 30, 60);
  cCtx.fillStyle = '#ffd54f'; // Gold handle
  cCtx.fillRect(x + 78, y - 32, 3, 5);

  // Cat bed next to house
  cCtx.fillStyle = '#ff8a80';
  cCtx.fillRect(x - 30, y - 10, 25, 10);
  cCtx.fillStyle = '#ffe082';
  cCtx.fillRect(x - 26, y - 14, 17, 7); // tiny sleeping cat block
}

function drawCherryPavilion(cCtx, x, y) {
  // Beautiful cherry pavilion (Location 3)
  cCtx.fillStyle = '#ff80ab'; // Pagoda bright pink
  cCtx.fillRect(x, y - 100, 130, 100);

  // Pillars
  cCtx.fillStyle = '#880e4f';
  cCtx.fillRect(x + 10, y - 90, 10, 90);
  cCtx.fillRect(x + 110, y - 90, 10, 90);

  // Archway
  cCtx.fillStyle = '#c2185b';
  cCtx.fillRect(x - 10, y - 110, 150, 15);
  
  // Pagoda double roof style
  cCtx.fillStyle = '#311b92';
  cCtx.beginPath();
  cCtx.moveTo(x - 20, y - 110);
  cCtx.lineTo(x + 65, y - 145);
  cCtx.lineTo(x + 150, y - 110);
  cCtx.fill();

  // Cozy Paper lanterns hanging
  cCtx.fillStyle = '#ffe082'; // glowing yellow
  cCtx.fillRect(x + 30, y - 80, 12, 18);
  cCtx.fillRect(x + 88, y - 80, 12, 18);
  cCtx.fillStyle = '#ff1744'; // red bands
  cCtx.fillRect(x + 30, y - 80, 12, 3);
  cCtx.fillRect(x + 88, y - 80, 12, 3);
  cCtx.fillRect(x + 30, y - 65, 12, 3);
  cCtx.fillRect(x + 88, y - 65, 12, 3);

  // Bridge under it / nearby
  cCtx.fillStyle = '#8d6e63';
  cCtx.fillRect(x - 70, y - 10, 60, 10);
  cCtx.fillRect(x - 70, y - 20, 5, 20);
  cCtx.fillRect(x - 15, y - 20, 5, 20);
  cCtx.strokeStyle = '#5d4037';
  cCtx.lineWidth = 3;
  cCtx.beginPath();
  cCtx.moveTo(x - 70, y - 20);
  cCtx.lineTo(x - 15, y - 20);
  cCtx.stroke();
}

function drawCastle(cCtx, x, y) {
  // Giant Pink Castle
  cCtx.fillStyle = '#ff80ab'; // Bright pink side towers
  cCtx.fillRect(x, y - 160, 45, 160);
  cCtx.fillRect(x + 165, y - 160, 45, 160);

  cCtx.fillStyle = '#f8bbd0'; // Light pink center body
  cCtx.fillRect(x + 45, y - 120, 120, 120);

  // Tower cones (purple/blue cozy)
  cCtx.fillStyle = '#7e57c2';
  cCtx.beginPath();
  cCtx.moveTo(x - 5, y - 160);
  cCtx.lineTo(x + 22, y - 210);
  cCtx.lineTo(x + 50, y - 160);
  cCtx.fill();

  cCtx.beginPath();
  cCtx.moveTo(x + 160, y - 160);
  cCtx.lineTo(x + 187, y - 210);
  cCtx.lineTo(x + 215, y - 160);
  cCtx.fill();

  // Banner/Flag on top
  cCtx.fillStyle = '#ff4081';
  cCtx.fillRect(x + 22, y - 230, 20, 12);
  cCtx.fillStyle = '#5d4037';
  cCtx.fillRect(x + 21, y - 235, 2, 25);

  // Battlements on main walls
  cCtx.fillStyle = '#f48fb1';
  for (let i = 0; i < 4; i++) {
    cCtx.fillRect(x + 50 + i * 32, y - 130, 16, 10);
  }

  // Giant Main Arch door
  cCtx.fillStyle = '#8d6e63';
  cCtx.fillRect(x + 85, y - 70, 40, 70);
  
  // Gold door details
  cCtx.fillStyle = '#ffe082';
  cCtx.fillRect(x + 103, y - 38, 4, 10);

  // Heart Fountains on sides
  cCtx.fillStyle = '#90caf9'; // water
  cCtx.fillRect(x - 50, y - 10, 35, 10);
  cCtx.fillRect(x + 225, y - 10, 35, 10);
  cCtx.fillStyle = '#8d6e63'; // stone
  cCtx.fillRect(x - 52, y - 5, 39, 5);
  cCtx.fillRect(x + 223, y - 5, 39, 5);
}

// Draw waving cat
function drawCat(cCtx, catObj) {
  const cx = catObj.x;
  const cy = catObj.y;

  // Body
  cCtx.fillStyle = '#cfd8dc'; // White-gray cat
  cCtx.fillRect(cx, cy - 12, 10, 12);
  // Head
  cCtx.fillRect(cx + 1, cy - 20, 8, 8);
  // Ears
  cCtx.fillStyle = '#b0bec5';
  cCtx.fillRect(cx + 1, cy - 22, 2, 2);
  cCtx.fillRect(cx + 7, cy - 22, 2, 2);
  // Eyes
  cCtx.fillStyle = '#ff7597';
  cCtx.fillRect(cx + 3, cy - 17, 1, 2);
  cCtx.fillRect(cx + 6, cy - 17, 1, 2);
  // Tail
  cCtx.fillStyle = '#cfd8dc';
  cCtx.fillRect(cx - 3, cy - 8, 4, 2);

  // Paw wave movement
  const wave = Math.sin(gameTime * 0.15) > 0;
  cCtx.fillStyle = '#ffffff';
  if (wave) {
    cCtx.fillRect(cx + 9, cy - 18, 3, 3); // hand raised
  } else {
    cCtx.fillRect(cx + 9, cy - 13, 3, 3); // hand down
  }
}

// Draw running bunny
function drawBunny(cCtx) {
  cCtx.fillStyle = '#f5f5f5'; // white bunny
  // Body
  cCtx.fillRect(bunny.x, bunny.y - 10, 12, 10);
  // Head
  cCtx.fillRect(bunny.x + (bunny.direction === 1 ? 8 : -4), bunny.y - 15, 8, 8);
  // Ears
  cCtx.fillRect(bunny.x + (bunny.direction === 1 ? 10 : -2), bunny.y - 20, 2, 6);
  cCtx.fillRect(bunny.x + (bunny.direction === 1 ? 13 : 1), bunny.y - 20, 2, 6);
  // Tail
  cCtx.fillRect(bunny.x + (bunny.direction === 1 ? -2 : 12), bunny.y - 6, 2, 3);
}

// Draw Princess
function drawPrincess(cCtx) {
  const px = player.x;
  const py = player.y;

  cCtx.save();
  // If facing left, flip sprite rendering
  if (player.direction === -1) {
    cCtx.translate(px + player.width, py);
    cCtx.scale(-1, 1);
  } else {
    cCtx.translate(px, py);
  }

  // Offset calculations for walking breathing & crouching
  let breathY = 0;
  let crownY = 0;
  let walkCycle = 0;
  let drawHeight = player.height;

  if (player.state === 'walking') {
    breathY = Math.floor(Math.sin(player.animTimer * 0.3) * 2);
    walkCycle = Math.floor(Math.sin(player.animTimer * 0.3) * 4);
  } else if (player.state === 'idle') {
    breathY = Math.floor(Math.sin(gameTime * 0.08) * 1.5);
  } else if (player.state === 'crouching') {
    drawHeight = player.height - 14;
    breathY = 0;
    crownY = 10;
  }

  // 1. Dress (Pink)
  cCtx.fillStyle = '#ff7597';
  cCtx.fillRect(2, 18 + breathY + (player.state === 'crouching' ? 10 : 0), 28, drawHeight - 24);
  // Dress border/shading
  cCtx.fillStyle = '#ff527b';
  cCtx.fillRect(2, drawHeight - 8, 28, 4);

  // 2. Head / Skin (Peach/Pastel)
  cCtx.fillStyle = '#ffebd7';
  cCtx.fillRect(6, 6 + breathY + crownY, 20, 14);

  // 3. Hair (Cute Brown Cozy Hair)
  cCtx.fillStyle = '#8d6e63';
  cCtx.fillRect(4, 4 + breathY + crownY, 24, 6); // hair top
  cCtx.fillRect(4, 10 + breathY + crownY, 4, 12); // left side locks
  cCtx.fillRect(24, 10 + breathY + crownY, 4, 12); // right side locks

  // 4. Eyes (Shining cozy black pixels)
  cCtx.fillStyle = '#3e2723';
  cCtx.fillRect(18, 11 + breathY + crownY, 2, 3);
  cCtx.fillRect(23, 11 + breathY + crownY, 2, 3);

  // 5. Crown (Gold Princess Crown)
  cCtx.fillStyle = '#ffd54f';
  cCtx.fillRect(10, 1 + breathY + crownY, 12, 3);
  cCtx.fillRect(10, -2 + breathY + crownY, 2, 3);
  cCtx.fillRect(15, -3 + breathY + crownY, 2, 4);
  cCtx.fillRect(20, -2 + breathY + crownY, 2, 3);

  // 6. Feet / Walking movement
  cCtx.fillStyle = '#8d6e63';
  if (player.state === 'walking') {
    // Alternate foot forward/backward
    cCtx.fillRect(6 + walkCycle, drawHeight - 4, 6, 4);
    cCtx.fillRect(20 - walkCycle, drawHeight - 4, 6, 4);
  } else if (player.state === 'crouching') {
    cCtx.fillRect(6, drawHeight - 4, 8, 4);
    cCtx.fillRect(18, drawHeight - 4, 8, 4);
  } else if (player.state === 'jumping') {
    cCtx.fillRect(5, drawHeight - 2, 6, 4);
    cCtx.fillRect(21, drawHeight - 6, 6, 4);
  } else {
    // Idle stance
    cCtx.fillRect(6, drawHeight - 4, 6, 4);
    cCtx.fillRect(20, drawHeight - 4, 6, 4);
  }

  cCtx.restore();
}

// ----------------------------------------------------
// SCENERY DRAWING
// ----------------------------------------------------

function drawTreesAndDecor(cCtx) {
  // Draw scenery along the way
  for (let x = 0; x < 5500; x += 150) {
    // Avoid drawing directly on top of cottage/house coordinates
    const nearLocation = LOCATIONS.some(loc => Math.abs(x - loc.x) < 140);
    if (!nearLocation) {
      // Wood trunk
      cCtx.fillStyle = '#8d6e63';
      cCtx.fillRect(x, 260, 12, 140);

      // Leaves (Cherry blossom pink trees at location 3 and forward, green elsewhere)
      if (x > 2600) {
        cCtx.fillStyle = '#ff80ab'; // Cherry blossom
        cCtx.fillRect(x - 25, 200, 62, 65);
        cCtx.fillStyle = '#f48fb1'; // Highlights
        cCtx.fillRect(x - 18, 190, 48, 15);
      } else {
        cCtx.fillStyle = '#a5d6a7'; // Soft Pastel Green
        cCtx.fillRect(x - 20, 210, 52, 55);
        cCtx.fillStyle = '#c8e6c9'; // Highlight
        cCtx.fillRect(x - 12, 198, 36, 15);
      }

      // Small flowers on grass
      cCtx.fillStyle = '#fff9c4'; // yellow daisy dots
      cCtx.fillRect(x + 40, 395, 4, 4);
      cCtx.fillStyle = '#ff8a80'; // red flower dots
      cCtx.fillRect(x - 30, 397, 4, 4);
    }
  }

  // Wooden bench details
  cCtx.fillStyle = '#a1887f';
  cCtx.fillRect(1350, 375, 40, 6);
  cCtx.fillRect(1350, 381, 4, 19);
  cCtx.fillRect(1386, 381, 4, 19);
  cCtx.fillRect(1350, 365, 4, 10);
  cCtx.fillRect(1386, 365, 4, 10);
  cCtx.fillRect(1350, 365, 40, 4);
}

// ----------------------------------------------------
// PARTICLE SYSTEMS MANAGEMENT
// ----------------------------------------------------

function updateParticles() {
  gameTime++;

  // 1. Cherry blossom petals falling
  if (Math.random() < 0.15) {
    petals.push({
      x: cameraX + Math.random() * V_WIDTH + 150,
      y: -20,
      speedY: 1 + Math.random() * 1.5,
      speedX: -1 - Math.random() * 1.5,
      sway: Math.random() * 3,
      size: 4 + Math.random() * 5
    });
  }
  for (let i = petals.length - 1; i >= 0; i--) {
    const p = petals[i];
    p.y += p.speedY;
    p.x += p.speedX + Math.sin(gameTime * 0.05 + p.sway) * 0.5;
    if (p.y > V_HEIGHT || p.x < cameraX - 50) {
      petals.splice(i, 1);
    }
  }

  // 2. Rain Toggle
  weatherTimer--;
  if (weatherTimer <= 0) {
    weatherState = weatherState === 'sunny' ? 'raining' : 'sunny';
    weatherTimer = 400 + Math.random() * 400; // time before transition
  }

  if (weatherState === 'raining') {
    for (let i = 0; i < 4; i++) {
      raindrops.push({
        x: cameraX + Math.random() * V_WIDTH + 100,
        y: -10,
        vy: 8 + Math.random() * 4,
        vx: -2
      });
    }
  }
  for (let i = raindrops.length - 1; i >= 0; i--) {
    const r = raindrops[i];
    r.y += r.vy;
    r.x += r.vx;
    // Splash ripple on ground
    if (r.y >= 395) {
      if (Math.random() < 0.1) {
        ripples.push({ x: r.x, y: 398, r: 1, alpha: 0.6 });
      }
      raindrops.splice(i, 1);
    }
  }

  // Water ripples updater
  for (let i = ripples.length - 1; i >= 0; i--) {
    const rip = ripples[i];
    rip.r += 0.4;
    rip.alpha -= 0.03;
    if (rip.alpha <= 0) {
      ripples.splice(i, 1);
    }
  }

  // 3. Fireflies and Stars in Sunset/Night
  if (isSunsetTriggered) {
    if (Math.random() < 0.1 && fireflies.length < 35) {
      fireflies.push({
        x: cameraX + Math.random() * V_WIDTH,
        y: 150 + Math.random() * 200,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        pulseSpeed: 0.05 + Math.random() * 0.05,
        alpha: 0
      });
    }

    stars.forEach(s => {
      if (s.alpha < 0.9) s.alpha += 0.005;
    });
  }

  // Fireflies update
  for (let i = fireflies.length - 1; i >= 0; i--) {
    const f = fireflies[i];
    f.x += f.vx;
    f.y += f.vy;
    f.alpha = Math.abs(Math.sin(gameTime * f.pulseSpeed));
    if (f.x < cameraX - 100 || f.x > cameraX + V_WIDTH + 100) {
      fireflies.splice(i, 1);
    }
  }

  // Clouds update
  clouds.forEach(c => {
    c.x += c.speed;
    if (c.x > V_WIDTH * 6) {
      c.x = -c.size * 2;
    }
  });

  // Sparkles
  if (Math.random() < 0.08) {
    sparkles.push({
      x: player.x + Math.random() * 100 - 50,
      y: player.y + Math.random() * 50 - 10,
      r: 2 + Math.random() * 3,
      alpha: 1,
      decay: 0.02 + Math.random() * 0.02
    });
  }
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const sp = sparkles[i];
    sp.y -= 0.5;
    sp.alpha -= sp.decay;
    if (sp.alpha <= 0) {
      sparkles.splice(i, 1);
    }
  }
}

// ----------------------------------------------------
// PHYSICS & COLLISION DETECTION
// ----------------------------------------------------

function updatePlayerPhysics() {
  // Horizontal movement
  if (keys.left) {
    player.vx = -player.speed;
    player.direction = -1;
    if (!player.isCrouching) player.state = 'walking';
  } else if (keys.right) {
    player.vx = player.speed;
    player.direction = 1;
    if (!player.isCrouching) player.state = 'walking';
  } else {
    player.vx = 0;
    if (player.isGrounded && !player.isCrouching) {
      player.state = 'idle';
    }
  }

  // Jump input
  if (keys.up && player.isGrounded && !player.isCrouching) {
    player.vy = player.jumpStrength;
    player.isGrounded = false;
    player.state = 'jumping';
  }

  // Crouch input
  if (keys.down && player.isGrounded) {
    player.isCrouching = true;
    player.state = 'crouching';
  } else {
    player.isCrouching = false;
  }

  // Gravity
  player.vy += player.gravity;

  // Apply velocity
  player.x += player.vx;
  player.y += player.vy;

  // Walk anim steps
  if (player.state === 'walking') {
    player.animTimer++;
  }

  // Ground collision boundary (398px virtual ground height)
  const groundLevel = 398 - player.height;
  if (player.y >= groundLevel) {
    player.y = groundLevel;
    player.vy = 0;
    player.isGrounded = true;
    if (player.state === 'jumping') {
      player.state = 'idle';
    }
  }

  // Constrain to horizontal world bounds
  if (player.x < 10) {
    player.x = 10;
  }
  // Hard stop at end of horizontal track near castle interior
  if (player.x > 4650) {
    player.x = 4650;
  }

  // Trigger Sunset / Night sky changes based on horizontal progression
  if (player.x > 2200 && !isSunsetTriggered) {
    isSunsetTriggered = true;
    const overlay = document.getElementById('ambient-overlay');
    overlay.style.backgroundColor = 'rgba(230, 81, 0, 0.28)'; // warm sunset orange
    overlay.style.opacity = '1';
  }
  if (player.x > 3800 && !isNightTriggered) {
    isNightTriggered = true;
    const overlay = document.getElementById('ambient-overlay');
    overlay.style.backgroundColor = 'rgba(49, 27, 146, 0.45)'; // deep night purple
    overlay.style.opacity = '1';
  }
}

// NPC & Butterfly interactions
function updateNPCs() {
  // Bunny behavior: runs away if princess gets close
  const distToBunny = Math.abs(player.x - bunny.x);
  if (distToBunny < 120 && bunny.state === 'idle') {
    bunny.state = 'running';
    bunny.direction = bunny.x < player.x ? -1 : 1;
  }
  if (bunny.state === 'running') {
    bunny.x += bunny.direction * 3.5;
    // hop animation
    bunny.y = 398 + Math.sin(gameTime * 0.4) * 8;
  }

  // Wave cats
  cats.forEach(c => {
    c.waveTimer++;
  });
}

// ----------------------------------------------------
// CAMERA WORK
// ----------------------------------------------------

function updateCamera() {
  // Smoothly center on princess with padding bounds
  const targetCamX = player.x - V_WIDTH / 2 + player.width / 2;
  cameraX += (targetCamX - cameraX) * 0.1;

  // Lock camera edges
  if (cameraX < 0) cameraX = 0;
  if (cameraX > 4800 - V_WIDTH) cameraX = 4800 - V_WIDTH;
}

// ----------------------------------------------------
// COLLISION CHECKS & PROMPTS
// ----------------------------------------------------

function checkInteractions() {
  if (isUIOpen || hasEnteredCastle) return;

  let promptText = "";
  activeLocation = null;

  // 1. Check locations
  LOCATIONS.forEach(loc => {
    const distance = Math.abs((player.x + player.width / 2) - loc.x);
    if (distance < 70) {
      activeLocation = loc;
      promptText = `TAP TO ENTER ${loc.name.toUpperCase()}`;
    }
  });

  // 2. Check Cats
  let activeCat = null;
  cats.forEach((c) => {
    const distance = Math.abs((player.x + player.width / 2) - c.x);
    if (distance < 50) {
      activeCat = c;
      promptText = "TAP TO TALK TO CAT";
    }
  });

  // Display prompt
  const pBox = document.getElementById('interact-prompt');
  if (promptText !== "") {
    pBox.innerText = promptText;
    pBox.style.display = 'block';

    // If E pressed, trigger it
    if (keys.interact) {
      keys.interact = false;
      if (activeLocation) {
        triggerLocation(activeLocation);
      } else if (activeCat) {
        triggerDialogue('cat');
      }
    }
  } else {
    pBox.style.display = 'none';
  }
}

// ----------------------------------------------------
// UI TRIGGERS AND LETTER VIEWS
// ----------------------------------------------------

function triggerLocation(loc) {
  isUIOpen = true;
  clearInputs();

  // Special handling for Castle Hall (Location 4)
  if (loc.id === 4) {
    hasEnteredCastle = true;
    openCastleHall();
    return;
  }

  // Open wax-sealed envelope first
  const overlay = document.getElementById('overlay-container');
  const envelope = document.getElementById('envelope-view');
  const letter = document.getElementById('letter-view');
  const scroll = document.getElementById('scroll-view');

  overlay.classList.add('active');
  envelope.style.display = 'flex';
  letter.style.display = 'none';
  scroll.style.display = 'none';

  // Floating heart animation upon clicking envelope
  envelope.onclick = () => {
    envelope.style.display = 'none';
    spawnFloatingHeart();
    
    if (loc.id === 1 || loc.id === 2) {
      letter.style.display = 'block';
      letter.classList.add('active');
      setupLetterContent(loc.id);
    } else if (loc.id === 3) {
      scroll.style.display = 'block';
      scroll.classList.add('active');
      setupScrollContent();
    }
  };
}

function triggerDialogue(type, messageText = null) {
  isUIOpen = true;
  clearInputs();

  const dBox = document.getElementById('dialogue-box');
  const dText = document.getElementById('dialogue-text');

  let text = "";
  if (type === 'cat') {
    text = GAME_CONFIG.catMessages[Math.floor(Math.random() * GAME_CONFIG.catMessages.length)];
  } else if (type === 'butterfly') {
    text = messageText || GAME_CONFIG.butterflyMessages[Math.floor(Math.random() * GAME_CONFIG.butterflyMessages.length)];
  }

  dText.innerText = text;
  dBox.style.display = 'block';

  // Dismiss on click/tap
  const dismissDialogue = () => {
    dBox.style.display = 'none';
    isUIOpen = false;
    document.removeEventListener('keydown', keyDismiss);
    dBox.removeEventListener('click', clickDismiss);
  };

  const keyDismiss = (e) => {
    if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter') {
      dismissDialogue();
    }
  };
  const clickDismiss = () => {
    dismissDialogue();
  };

  setTimeout(() => {
    document.addEventListener('keydown', keyDismiss);
    dBox.addEventListener('click', clickDismiss);
  }, 100);
}

// Populating location letters
function setupLetterContent(locId) {
  const title = document.getElementById('letter-title');
  const body = document.getElementById('letter-body');
  const img = document.getElementById('letter-img');
  const caption = document.getElementById('letter-caption');

  if (locId === 1) {
    title.innerText = GAME_CONFIG.location1.title;
    body.innerText = GAME_CONFIG.location1.text;
    img.src = GAME_CONFIG.location1.image;
    caption.innerText = GAME_CONFIG.location1.caption;
  } else if (locId === 2) {
    title.innerText = GAME_CONFIG.location2.title;
    body.innerText = GAME_CONFIG.location2.text;
    img.src = GAME_CONFIG.location2.image;
    caption.innerText = GAME_CONFIG.location2.caption;
  }
}

// Populating Location 3 Scroll
function setupScrollContent() {
  const title = document.getElementById('scroll-title');
  const body = document.getElementById('scroll-body');
  const imgContainer = document.getElementById('scroll-images');

  title.innerText = GAME_CONFIG.location3.title;
  body.innerText = GAME_CONFIG.location3.text;
  imgContainer.innerHTML = "";

  GAME_CONFIG.location3.images.forEach(imgData => {
    const div = document.createElement('div');
    div.className = "letter-img-container";
    div.innerHTML = `
      <img src="${imgData.url}" class="letter-img" alt="Memory photo">
      <p class="letter-caption">${imgData.caption}</p>
    `;
    imgContainer.appendChild(div);
  });
}

// Castle Birthday Hall Setup
function openCastleHall() {
  const overlay = document.getElementById('overlay-container');
  const castleView = document.getElementById('castle-view');
  const envelope = document.getElementById('envelope-view');
  
  overlay.classList.add('active');
  envelope.style.display = 'none';
  castleView.style.display = 'flex';
  castleView.classList.add('active');

  const bNoteText = document.getElementById('birthday-note-text');
  bNoteText.innerText = GAME_CONFIG.castle.birthdayMessage;

  // Build 8 gallery pictures
  const galleryGrid = document.getElementById('castle-gallery');
  galleryGrid.innerHTML = "";
  GAME_CONFIG.castle.gallery.forEach((url, i) => {
    const frame = document.createElement('div');
    frame.className = "photo-frame";
    frame.innerHTML = `<img src="${url}" alt="Memory photo #${i+1}">`;
    galleryGrid.appendChild(frame);
  });

  // Reset button reveal state
  const bNoteContainer = document.getElementById('birthday-note');
  bNoteContainer.classList.remove('visible');
  
  const revealBtn = document.getElementById('reveal-birthday-btn');
  revealBtn.style.display = 'block';

  revealBtn.onclick = () => {
    revealBtn.style.display = 'none';
    bNoteContainer.classList.add('visible');
    spawnFloatingHeart();
    
    // Cascading fade-in animation for 8 frames
    const frames = document.querySelectorAll('.photo-frame');
    frames.forEach((f, index) => {
      setTimeout(() => {
        f.classList.add('show');
      }, index * 250);
    });
  };
}

// Click listener to grab coordinates of butterflies
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = V_WIDTH / rect.width;
  const scaleY = V_HEIGHT / rect.height;
  
  const clickX = (e.clientX - rect.left) * scaleX + cameraX;
  const clickY = (e.clientY - rect.top) * scaleY;

  // Check if click was on a butterfly
  butterflies.forEach(b => {
    const dist = Math.sqrt(Math.pow(clickX - b.x, 2) + Math.pow(clickY - b.y, 2));
    if (dist < 35) {
      spawnFloatingHeart();
      triggerDialogue('butterfly', GAME_CONFIG.butterflyMessages[b.msgIndex]);
    }
  });
});

// Floating hearts generator
function spawnFloatingHeart() {
  const spawner = document.getElementById('heart-spawner');
  for (let i = 0; i < 8; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.innerHTML = '❤️';
    heart.style.left = (20 + Math.random() * 60) + '%';
    heart.style.animationDelay = (i * 0.15) + 's';
    spawner.appendChild(heart);

    // clean up after animation
    setTimeout(() => {
      heart.remove();
    }, 3200);
  }
}

// ----------------------------------------------------
// RENDER TICK LOOP
// ----------------------------------------------------

function draw() {
  ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

  // Background Sky coloring (Fades from light pink pastel to orange to dark blue)
  let skyGradient = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
  if (isNightTriggered) {
    skyGradient.addColorStop(0, '#1a103c'); // dark violet sky
    skyGradient.addColorStop(1, '#ffc1cc'); // cozy pastel pink horizon
  } else if (isSunsetTriggered) {
    skyGradient.addColorStop(0, '#ff9e80'); // bright sunset orange
    skyGradient.addColorStop(1, '#ffc1cc');
  } else {
    skyGradient.addColorStop(0, '#ffe3f0'); // sunny soft pink
    skyGradient.addColorStop(1, '#ffebee');
  }
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

  // Draw Sun / Moon
  ctx.fillStyle = '#fffde7';
  if (isNightTriggered) {
    // Moon
    ctx.beginPath();
    ctx.arc(V_WIDTH - 150, 70, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = skyGradient;
    ctx.beginPath();
    ctx.arc(V_WIDTH - 160, 70, 22, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Soft sun
    ctx.shadowColor = 'rgba(255,255,255,0.4)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(V_WIDTH - 120, 80, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // reset
  }

  // Draw Clouds
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  clouds.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x - cameraX, c.y, c.size * 0.5, 0, Math.PI * 2);
    ctx.arc(c.x - cameraX + c.size * 0.3, c.y - 10, c.size * 0.45, 0, Math.PI * 2);
    ctx.arc(c.x - cameraX - c.size * 0.3, c.y + 5, c.size * 0.4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Render Stars
  if (isSunsetTriggered || isNightTriggered) {
    stars.forEach(s => {
      ctx.fillStyle = `rgba(255,255,255, ${s.alpha * Math.abs(Math.sin(gameTime * s.sparkleSpeed))})`;
      ctx.fillRect(s.x, s.y, 3, 3);
    });
  }

  // Parallax background trees/mountains
  ctx.fillStyle = 'rgba(244, 143, 177, 0.3)'; // soft pink silhouette hills
  ctx.beginPath();
  ctx.moveTo(0, 398);
  for (let i = 0; i <= V_WIDTH; i += 100) {
    const h = 260 + Math.sin((i + cameraX * 0.3) * 0.005) * 45;
    ctx.lineTo(i, h);
  }
  ctx.lineTo(V_WIDTH, 398);
  ctx.fill();

  ctx.save();
  ctx.translate(-cameraX, 0);

  // Draw grass details and ground path
  ctx.fillStyle = '#e8f5e9'; // Pastel grass top
  ctx.fillRect(0, 395, 4800, 10);
  ctx.fillStyle = '#c8e6c9'; // dirt layer
  ctx.fillRect(0, 405, 4800, 100);

  // Draw flowers, trees and deco
  drawTreesAndDecor(ctx);

  // Draw interactive locations
  drawPixelCottage(ctx, LOCATIONS[0].x, 395);
  drawCozyHouse(ctx, LOCATIONS[1].x, 395);
  drawCherryPavilion(ctx, LOCATIONS[2].x, 395);
  drawCastle(ctx, LOCATIONS[3].x, 395);

  // Draw interactive bunnies & cats
  drawBunny(ctx);
  cats.forEach(c => drawCat(ctx, c));

  // Draw Butterflies
  butterflies.forEach(b => {
    // Flutter motion
    b.x += b.vx;
    b.y += b.vy + Math.sin(gameTime * 0.2) * 0.5;

    // bounce off screens
    if (b.y < 80 || b.y > 350) b.vy *= -1;

    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, 5, 5); // left wing
    ctx.fillRect(b.x + 6, b.y, 5, 5); // right wing
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(b.x + 5, b.y + 1, 1, 3); // center body
  });

  // Draw Rain ripples
  ctx.strokeStyle = 'rgba(144, 202, 249, 0.4)';
  ctx.lineWidth = 1.5;
  ripples.forEach(rip => {
    ctx.beginPath();
    ctx.ellipse(rip.x, rip.y, rip.r * 2, rip.r * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Draw Sparkles
  sparkles.forEach(sp => {
    ctx.fillStyle = `rgba(255, 235, 59, ${sp.alpha})`;
    ctx.fillRect(sp.x, sp.y, sp.r, sp.r);
  });

  // Draw main princess character
  drawPrincess(ctx);

  ctx.restore();

  // Render Raindrops (fixed to camera screen)
  if (weatherState === 'raining') {
    ctx.strokeStyle = 'rgba(144, 202, 249, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    raindrops.forEach(r => {
      ctx.moveTo(r.x - cameraX, r.y);
      ctx.lineTo(r.x - cameraX - 4, r.y + 12);
    });
    ctx.stroke();
  }

  // Draw floating cherry blossom petals
  ctx.fillStyle = 'rgba(255, 128, 171, 0.7)';
  petals.forEach(p => {
    ctx.fillRect(p.x - cameraX, p.y, p.size, p.size);
  });
}

// ----------------------------------------------------
// SCENE / TRANSITION LOOPS
// ----------------------------------------------------

function update() {
  if (!isPlaying) return;
  if (!isUIOpen) {
    updatePlayerPhysics();
    updateNPCs();
    updateCamera();
  }
  updateParticles();
  checkInteractions();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// End Game credits rolling sequence
function playCreditsSequence() {
  const credits = document.getElementById('credits-screen');
  const linesBox = document.getElementById('credits-lines-container');
  
  credits.style.display = 'flex';
  setTimeout(() => {
    credits.style.opacity = '1';
  }, 100);

  // Clear existing and build credits lines
  linesBox.innerHTML = "";
  GAME_CONFIG.closing.lines.forEach((line) => {
    const p = document.createElement('p');
    p.className = 'credits-line';
    p.innerText = line;
    linesBox.appendChild(p);
  });

  const lines = document.querySelectorAll('.credits-line');
  lines.forEach((l, index) => {
    setTimeout(() => {
      l.classList.add('visible');
    }, index * 2500);
  });
}

// ----------------------------------------------------
// BROWSER & BUTTON EVENT LISTENERS
// ----------------------------------------------------

// START BUTTON CLICK EVENT
document.getElementById('start-btn').addEventListener('click', () => {
  const label = document.getElementById('intro-text-label');
  const startBtn = document.getElementById('start-btn');
  const prompt = document.getElementById('start-prompt');

  // Start synth music immediately on gesture
  AudioEngine.start();

  startBtn.style.display = 'none';

  // Play introduction sequence lines
  let currentLine = 0;
  const showNextLine = () => {
    if (currentLine < GAME_CONFIG.opening.lines.length) {
      label.classList.remove('visible');
      setTimeout(() => {
        label.innerText = GAME_CONFIG.opening.lines[currentLine];
        label.classList.add('visible');
        currentLine++;
        setTimeout(showNextLine, 3500);
      }, 1000);
    } else {
      // Intro ends, show start prompt "Walk to begin..."
      label.classList.remove('visible');
      prompt.style.display = 'block';

      // Click anywhere or tap to start actual game loop
      const enterGame = () => {
        document.getElementById('start-screen').style.opacity = '0';
        setTimeout(() => {
          document.getElementById('start-screen').style.display = 'none';
        }, 1500);
        isPlaying = true;
        document.removeEventListener('click', enterGame);
        document.removeEventListener('keydown', enterGame);
      };
      document.addEventListener('click', enterGame);
      document.addEventListener('keydown', enterGame);
    }
  };

  showNextLine();
});

// Close UI Overlays
function closeOverlay() {
  const overlay = document.getElementById('overlay-container');
  overlay.classList.remove('active');
  isUIOpen = false;
  clearInputs();

  // If this was the castle hall closing, go directly to credits
  if (hasEnteredCastle) {
    playCreditsSequence();
  }
}

document.getElementById('close-letter-btn').onclick = closeOverlay;
document.getElementById('close-scroll-btn').onclick = closeOverlay;
document.getElementById('close-castle-btn').onclick = closeOverlay;

// ----------------------------------------------------
// INPUT KEY LISTENER HANDLING (KEYBOARD)
// ----------------------------------------------------

window.addEventListener('keydown', (e) => {
  if (isUIOpen) return;
  switch (e.key.toLowerCase()) {
    case 'a':
    case 'arrowleft':
      keys.left = true;
      break;
    case 'd':
    case 'arrowright':
      keys.right = true;
      break;
    case 'w':
    case 'arrowup':
      keys.up = true;
      break;
    case 's':
    case 'arrowdown':
      keys.down = true;
      break;
    case 'e':
      keys.interact = true;
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.key.toLowerCase()) {
    case 'a':
    case 'arrowleft':
      keys.left = false;
      break;
    case 'd':
    case 'arrowright':
      keys.right = false;
      break;
    case 'w':
    case 'arrowup':
      keys.up = false;
      break;
    case 's':
    case 'arrowdown':
      keys.down = false;
      break;
    case 'e':
      keys.interact = false;
      break;
  }
});

// ----------------------------------------------------
// VIRTUAL D-PAD INPUT CONTROL HANDLING (MOBILE)
// ----------------------------------------------------

function setupMobileControls() {
  const btnUp = document.getElementById('btn-up');
  const btnDown = document.getElementById('btn-down');
  const btnLeft = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');
  const btnInteract = document.getElementById('btn-interact');

  // Helper touch handlers
  const handleTouch = (btn, key) => {
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!isUIOpen) keys[key] = true;
    });
    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      keys[key] = false;
    });
  };

  handleTouch(btnUp, 'up');
  handleTouch(btnDown, 'down');
  handleTouch(btnLeft, 'left');
  handleTouch(btnRight, 'right');

  // Interact button handles click & touch
  const triggerInteract = (e) => {
    e.preventDefault();
    if (!isUIOpen) {
      keys.interact = true;
    }
  };
  btnInteract.addEventListener('touchstart', triggerInteract);
  btnInteract.addEventListener('click', triggerInteract);
}

setupMobileControls();
initParticles();
loop();
