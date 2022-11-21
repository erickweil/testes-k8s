package main

import (
	"example/gobackendapi/api"
	"example/gobackendapi/simulation"
	"flag"
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

func testSim() {
	simulation.InitGrid(64,64)

	simulation.Set(5,5,1)
	simulation.Set(6,5,1)
	simulation.Set(7,5,1)
	simulation.Set(7,4,1)
	simulation.Set(6,3,1)

	//fmt.Println(simulation.ToString())
	
	for i := 0; i < 50; i++ {
		simulation.Step()
		//fmt.Println("----------")
		//fmt.Println(simulation.ToString())
		//fmt.Println("----------\n\n")
	}

	fmt.Println(simulation.ToBase64())
}

func goDotEnvLoad() {
	// load .env file
	err := godotenv.Load(".env")
  
	if err != nil {
	  fmt.Println("Error loading .env file")
	}
}

// use godot package to load/read the .env file and
// return the value of the key
func envVariable(key string) string {
	return os.Getenv(key)
}

func intEnvVariable(key string,defult int) int {
	var value, error = strconv.Atoi(os.Getenv(key))
	if error != nil {
		return defult
	} else {
		return value
	}
}

func main() {
	width := flag.Int("w",intEnvVariable("WIDTH",256),"Largura da Grade")
	height := flag.Int("h",intEnvVariable("HEIGHT",256),"Altura da Grade")
	sleep := flag.Int("d",intEnvVariable("SLEEP",100),"Delay atualização simulação")
	flag.Parse()
	api.Main(*width,*height,*sleep)
}