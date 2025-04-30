// création objets
var gameObject = {};
var allPlants = [];

class Plant {
  constructor(type, luck) {
      this.type = type;
      this.x = gameObject.dronePosition[0]
      this.y = gameObject.dronePosition[1]
      this.stage = 0; // 0 = Seed, 1 = Sprout, etc.
      this.grow(luck); // Start growing immediately
  }

  async grow(luck) {
    this.growthInterval = setInterval(() => {
      if (this.stage < 3) {
        if (Math.floor(Math.random() * luck) === 0) {
          this.stage++;
          gameObject.plantValues[this.y - 1][this.x - 1][1] = this.stage;
          self.postMessage({ type: "plantUpdate", data: [this.x, this.y, this.type, this.stage] });
        }
      } else {
        clearInterval(this.growthInterval);
        this.growthInterval = null;
  
        // Remove this plant from the allPlants array
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

function stopAllPlantGrowth() {
    allPlants.forEach(plant => plant.stopGrowth());
  }

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
                var myPlant = new Plant(1, 2);
              break;

            case "carrot":
                gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] = 2
                self.postMessage({ type: "plantUpdate", data: [gameObject.dronePosition[0] , gameObject.dronePosition[1] , 2, 0] });
                var myPlant = new Plant(2, 5);
                break;

            case "apple":
                gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] = 2
                self.postMessage({ type: "plantUpdate", data: [gameObject.dronePosition[0] , gameObject.dronePosition[1] , 2, 0] });
                var myPlant = new Plant(3, 10);
                break;

            default:
             // console.log(`Sorry, we are out of ${data}.`);
          }

          allPlants.push(myPlant);

    } else if (type === "stopGrowing"){

        stopAllPlantGrowth();
        
    } else {
    console.log("fin")
    }

}