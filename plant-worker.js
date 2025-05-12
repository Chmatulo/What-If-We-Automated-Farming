// création objets
var gameObject = {};
var allPlants = [];

// Class plante
class Plant {
  constructor(type, luck, stage, x, y) {
      this.type = type;
      this.x = x
      this.y = y
      this.stage = stage; // 0 = Seed, 1 = Sprout, etc.
      this.grow(luck); // Start growing immediately
  }

// Fonction pour faire grandir la plante
  async grow(luck) {
    this.growthInterval = setInterval(() => {
      if (this.stage < 3) {
        if (Math.floor(Math.random() * luck) === 0) {
          this.stage++;
          gameObject.plantValues[this.y - 1][this.x - 1][1] = this.stage;
          self.postMessage({ type: "plantUpdate", data: [this.x, this.y, this.type, this.stage] });
        }
      } else {
        // Lorsqu'elle a fini de pousser
        clearInterval(this.growthInterval);
        this.growthInterval = null;
  
        // Retirer la plante depuis le tableau des plantes
        const index = allPlants.indexOf(this);
        if (index !== -1) {
          allPlants.splice(index, 1);
        }
      }
    }, 1000);
  }

  stopGrowth() {
    if (this.growthInterval) {
      clearInterval(this.growthInterval);
    }
  }
}

// Arreter la pousse de toutes les plantes
function stopAllPlantGrowth() {
    allPlants.forEach(plant => plant.stopGrowth());
  }

// Messages recu depuis main.js
self.onmessage = (event) => {
   
    const { type, data } = event.data;

      
    if (type === "gameObject") {

      gameObject = JSON.parse(JSON.stringify(data));
      self.postMessage({ type: "test", data: "hello" });

    } else if(type === "plant"){

        switch (data) {
            case "wheat":
                gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] = 1
                self.postMessage({ type: "plantUpdate", data: [gameObject.dronePosition[0] , gameObject.dronePosition[1] , 1, 0] });
                if (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 3){
                  var myPlant = new Plant(1, 2, 0, gameObject.dronePosition[0], gameObject.dronePosition[1]);
                }
              break;

            case "carrot":
                gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] = 2
                self.postMessage({ type: "plantUpdate", data: [gameObject.dronePosition[0] , gameObject.dronePosition[1] , 2, 0] });
                if (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 3){
                  var myPlant = new Plant(2, 5, 0, gameObject.dronePosition[0], gameObject.dronePosition[1]);
                }
                break;

            case "apple":
                gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] = 3
                self.postMessage({ type: "plantUpdate", data: [gameObject.dronePosition[0] , gameObject.dronePosition[1] , 3, 0] });
                if (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 3){
                  var myPlant = new Plant(3, 10, 0, gameObject.dronePosition[0], gameObject.dronePosition[1]);
                }
                break;

          }

          allPlants.push(myPlant);

    } else if (type === "stopGrowing"){

      stopAllPlantGrowth();
        
    } else if (type === "firstTimeLoading"){
      gameObject = JSON.parse(JSON.stringify(data));

      for (let y = 0; y < gameObject.plantValues.length; y++) {
        for (let x = 0; x < gameObject.plantValues[y].length; x++) {
          let plant = gameObject.plantValues[y][x][0];
          let stage = gameObject.plantValues[y][x][1]

          if (plant > 0 && gameObject.soilValues[y][x] == 3){
            var myPlant = new Plant(plant, 5, stage, x+1, y+1);
            allPlants.push(myPlant)
          }

        }
      }
      
    } else if(type === "water"){
        let luck;
        let plantType = data[2]
        switch (plantType){
          case 1:
            luck = 2
            break;
          case 2:
            luck = 5;
            break;
          case 3:
            luck = 10;
            break;
        }
        var myPlant = new Plant(data[2], luck, data[3], data[0], data[1]);
    }
}