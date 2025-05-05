const tillSoundFiles = [
    'data/sound/Till/Hoe_till1.ogg',
    'data/sound/Till/Hoe_till2.ogg',
    'data/sound/Till/Hoe_till3.ogg',
    'data/sound/Till/Hoe_till4.ogg',
  ];
  
  const plantSoundFiles = [
    'data/sound/Plant/Crop_place1.ogg',
    'data/sound/Plant/Crop_place2.ogg',
    'data/sound/Plant/Crop_place3.ogg',
    'data/sound/Plant/Crop_place4.ogg',
    'data/sound/Plant/Crop_place5.ogg',
    'data/sound/Plant/Crop_place6.ogg',
  ];
  
  const coinSoundFiles = [
    'data/sound/misc/pickupCoin.wav'
  ];
  
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
  
  function loadSounds(files) {
    return files.map(file => {
      const audio = new Audio(file);
      audio.load();
      return audio;
    });
  }
  
  const tillSounds = loadSounds(tillSoundFiles);
  const plantSounds = loadSounds(plantSoundFiles);
  const coinSounds = loadSounds(coinSoundFiles);
  const musics = loadSounds(musicSoundFiles);
  
  plantSounds.forEach(sound => {
    sound.volume = gameObject.droneVolume;
  });
  
  tillSounds.forEach(sound => {
    sound.volume = gameObject.droneVolume;
  });
  
  coinSounds.forEach(sound => {
    sound.volume = gameObject.autresVolume;
  });
  
  
  const soundMap = {
    till: { sounds: tillSounds },
    plant: { sounds: plantSounds },
    coin: { sounds: coinSounds },
    music: { sounds: musics },
  };
  
  let randomizedMusicArray;
  
  function randomizeMusic(){
      randomizedMusicArray = getShuffledArray(musicSoundFiles.length)
  }
  
  function getShuffledArray(x) {
    const arr = Array.from({ length: x }, (_, i) => i); // [0, 1, ..., x-1]
  
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
      [arr[i], arr[j]] = [arr[j], arr[i]]; // swap elements
    }
  
    return arr;
  }
  
  var music;
  
  function playMusic(){
  
    const config = soundMap["music"]
  
    music = config.sounds[randomizedMusicArray[0]]
    music.currentTime = 0
  
    let firstElement = randomizedMusicArray.shift();
    randomizedMusicArray.push(firstElement);
  
    music.volume = gameObject.musicVolume
    music.addEventListener("ended", playMusic);
    music.play()
  }
  
  randomizeMusic()
  
  
  function playSound(type) {
  
    const config = soundMap[type];
  
    if (config && config.sounds.length > 0) {
  
      const selectedSound = config.sounds[Math.floor(Math.random() * config.sounds.length)];
      selectedSound.currentTime = 0;
  
     // selectedSound.volume = volume;
      selectedSound.play();
    }
  }


  
  const musicSlider = document.getElementById('music-slider');
  const musicValue = document.getElementById('music-value');
  musicSlider.value = gameObject.musicVolume * 500
  musicValue.textContent = musicSlider.value + "%";
  
  const droneSlider = document.getElementById('drone-slider');
  const droneValue = document.getElementById('drone-value');
  droneSlider.value = gameObject.droneVolume * 400
  droneValue.textContent = droneSlider.value + "%";
  
  const autresSlider = document.getElementById('autres-slider');
  const autresValue = document.getElementById('autres-value');
  autresSlider.value = gameObject.autresVolume * 400
  autresValue.textContent = autresSlider.value + "%";
  
  musicSlider.addEventListener('input', updateVolume) 
  
  droneSlider.addEventListener('input', updateVolume)
  
  autresSlider.addEventListener('input', updateVolume)



  function updateVolume(){

    console.log("updating volume")

    // Musique

    musicValue.textContent = musicSlider.value + "%";
      gameObject.musicVolume = musicSlider.value/400
      localStorage.setItem('musicVolume', gameObject.musicVolume.toString());
      music.volume = gameObject.musicVolume

      console.log(gameObject.musicVolume)
      
    // Autres
  
    autresValue.textContent = autresSlider.value + "%";
  
    const volume1 = parseFloat(autresSlider.value) / 400;

    gameObject.autresVolume = volume1
  
    coinSounds.forEach(sound => {
      sound.volume = gameObject.autresVolume;
    });

    // Drone

    droneValue.textContent = droneSlider.value + "%";
  
    const volume2 = parseFloat(droneSlider.value) / 400;
  
    gameObject.droneVolume = volume2
    
    plantSounds.forEach(sound => {
      sound.volume = volume2;
    });
  
    tillSounds.forEach(sound => {
      sound.volume = volume2;
    });

  }
  