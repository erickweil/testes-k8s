package main

import (
	"example/gobackendapi/api"
	"example/gobackendapi/simulation"
	"fmt"
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

func main() {
	api.Main()
}