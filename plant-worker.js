// création objets
var gameObject = {};

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
              if (Math.floor(Math.random() * luck) == 0){
                this.stage++;
                gameObject.plantValues[this.y-1][this.x-1][1] = this.stage;
                self.postMessage({ type: "plantUpdate", data: [this.x , this.y , this.type, this.stage] });
              }
          } else {
              clearInterval(this.growthInterval); // Stop when fully grown
          }

      }, 1000); // Change phase every second
  }
}

self.onmessage = (event) => {
   
    const { type, data } = event.data;

      
    if (type === "gameObject") {

      console.log("game Object recevied plant worker")
      gameObject = JSON.parse(JSON.stringify(data));
      self.postMessage({ type: "test", data: "hello" });

    } else if(type === "plant"){

        switch (data) {
            case "wheat":
                console.log("planting wheat")
                gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] = 1
                self.postMessage({ type: "plantUpdate", data: [gameObject.dronePosition[0] , gameObject.dronePosition[1] , 1, 0] });
                var myPlant = new Plant(1, 5);
              break;
            case "carrot":

              break;
            case "apple":

              break;
            default:
             // console.log(`Sorry, we are out of ${data}.`);
          }

    } else {
    console.log("fin")
    }

}