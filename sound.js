// Fichiers son

// Fichiers becher
const tillSoundFiles = [
    'data/sound/Till/Hoe_till1.ogg',
    'data/sound/Till/Hoe_till2.ogg',
    'data/sound/Till/Hoe_till3.ogg',
    'data/sound/Till/Hoe_till4.ogg',
  ];
  
// Fichier planter
const plantSoundFiles = [
    'data/sound/Plant/Crop_place1.ogg',
    'data/sound/Plant/Crop_place2.ogg',
    'data/sound/Plant/Crop_place3.ogg',
    'data/sound/Plant/Crop_place4.ogg',
    'data/sound/Plant/Crop_place5.ogg',
    'data/sound/Plant/Crop_place6.ogg',
  ];

// Fichier vendre
const coinSoundFiles = [
    'data/sound/misc/pickupCoin.wav'
  ];

// Fichiers arroser
const waterSoundFiles = [
    'data/sound/misc/water1.ogg',
    'data/sound/misc/water2.ogg',
    'data/sound/misc/water3.ogg'
  ]
  
// Fichiers musique
const musicSoundFiles = [
    'data/sound/Music/Veracruz.mp3',
    'data/sound/Music/The Colonel.mp3',
    'data/sound/Music/Take Your Time.mp3',
    'data/sound/Music/Nat Keefe & Hot Buttered Rum - Cats Searching for the Truth.mp3',
    'data/sound/Music/Leaning On the Everlasting Arms.mp3',
    "data/sound/Music/Dude, Where's My Horse_.mp3",
    'data/sound/Music/Dan Lebowitz - Hickory Hollow.mp3',
    'data/sound/Music/Covid Come Not Near.mp3',
    
  ];

// Fonction prechargement, creation objet audio
function loadSounds(files) {
  return files.map(file => {
    const audio = new Audio(file);
    audio.load();
    return audio;
    });
  }

// Prechargement des sons
const tillSounds = loadSounds(tillSoundFiles);
const plantSounds = loadSounds(plantSoundFiles);
const coinSounds = loadSounds(coinSoundFiles);
const waterSounds = loadSounds(waterSoundFiles);
const musics = loadSounds(musicSoundFiles);

// Ajout volume correspondant
plantSounds.forEach(sound => {
  sound.volume = volumesArray[1];
});

tillSounds.forEach(sound => {
  sound.volume = volumesArray[1];
});

coinSounds.forEach(sound => {
  sound.volume = volumesArray[2];
});

 waterSounds.forEach(sound => {
  sound.volume = volumesArray[2];
});
  
// Map des sons
const soundMap = {
  till: { sounds: tillSounds },
  plant: { sounds: plantSounds },
  coin: { sounds: coinSounds },
  water: {sounds: waterSounds },
  music: { sounds: musics },
};
  
let randomizedMusicArray; // variable tableau musique aleatoires
  
// Fonction qui appelle une fonction pour generer un tableau aleatoire de musiques (????)
function randomizeMusic(){
  randomizedMusicArray = getShuffledArray(musicSoundFiles.length)
}

// Fonction pour generer un tableau aleatoire de musiques
function getShuffledArray(x) {
  const arr = Array.from({ length: x }, (_, i) => i); // creation tableau de x elements allant de 0 a x - 1

  // Fisher-Yates shuffle (melange)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [arr[i], arr[j]] = [arr[j], arr[i]]; // swap elements
  }

  return arr;
}

//varaible musique
var music;

// Fonction pour lancer une musique
function playMusic(){

  const config = soundMap["music"]

  music = config.sounds[randomizedMusicArray[0]]
  music.currentTime = 0

  let firstElement = randomizedMusicArray.shift();
  randomizedMusicArray.push(firstElement);

  music.volume = volumesArray[0]
  music.addEventListener("ended", playMusic);
  music.play()
}
  
// Melanger
randomizeMusic()
  
// Fonction pour jouer un son (bruitage)
function playSound(type) {

  const config = soundMap[type];

  if (config && config.sounds.length > 0) {

    const selectedSound = config.sounds[Math.floor(Math.random() * config.sounds.length)];
    selectedSound.currentTime = 0;

    selectedSound.play();
  }
}
  
// Ajouter event listener aux slider pour modifier la valeur des volumes
musicSlider.addEventListener('input', updateVolume) 
droneSlider.addEventListener('input', updateVolume)
autresSlider.addEventListener('input', updateVolume)

// Fonction pour modifier volume
function updateVolume(){
  // Musique
  musicValue.textContent = musicSlider.value + "%";
  volumesArray[0] = musicSlider.value/500
  music.volume = volumesArray[0]

  // Drone
  droneValue.textContent = droneSlider.value + "%";

  const volume2 = parseFloat(droneSlider.value) / 400;

  volumesArray[1] = volume2
  
  plantSounds.forEach(sound => {
    sound.volume = volume2;
  });

  tillSounds.forEach(sound => {
    sound.volume = volume2;
  });
  waterSounds.forEach(sound => {
    sound.volume = volume2;
  });
  
  // Autres
  autresValue.textContent = autresSlider.value + "%";

  const volume1 = parseFloat(autresSlider.value) / 400;
  volumesArray[2] = volume1

  coinSounds.forEach(sound => {
    sound.volume = volumesArray[2];
  });
  localStorage.setItem('volumesArray', JSON.stringify(volumesArray))
}

// Attendre que l'utilisateur clique pour lancer la musique (interaction avec le DOM pour lancer une musique)
document.addEventListener('click', startAudioOnce);

// Lancer la musique et actualiser les valeurs des volumes
function startAudioOnce() {

  playMusic()
  updateVolume()

  document.removeEventListener('click', startAudioOnce);
}