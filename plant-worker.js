// création objets
var gameObject = {};

class Plant {
  constructor(name, luck) {
      this.name = name;
      this.x = gameObject.dronePosition[0]
      this.y = gameObject.dronePosition[1]
      this.stage = 0; // 0 = Seed, 1 = Sprout, etc.
      this.grow(luck); // Start growing immediately
  }

  async grow(luck) {
      this.growthInterval = setInterval(() => {
          if (this.stage < 3) {
            console.log("coords :", this.x, this.y, this.stage)
              if (Math.floor(Math.random() * luck) == 1){
                this.stage++;
                gameObject.plantValues[this.y-1][this.x-1][1] = this.stage;
                self.postMessage({ type: "plants", data: gameObject.plantValues });
              }
          } else {
              clearInterval(this.growthInterval); // Stop when fully grown
              console.log("Final state :", gameObject)
          }
      }, 1000); // Change phase every 3 seconds
  }
}

self.onmessage = (event) => {
   
    const { type, data } = event.data;

      
    if (type === "gameObject") {
        gameObject = JSON.parse(JSON.stringify(data));
    } else if(type === "plant"){
        console.log(data)
        switch (data) {
            case "wheat":
                gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] = 1
                var myPlant = new Plant("Wheat", 5);
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