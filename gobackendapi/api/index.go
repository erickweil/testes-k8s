package api

import (
	"bytes"
	"example/gobackendapi/simulation"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)
func getIndex(context *gin.Context) {
	context.JSON(http.StatusOK,gin.H{"status": "Você está perdido?"})
}

func getGrade(context *gin.Context) {
	var gradeb64 = simulation.ToBase64()

	// É mais eficiente construir o json manualmente numa resposta de texto
	// porque provavelmente a biblioteca irá ter que atravessar todo o texto base64
	// OBS: DÁ NA MESMA PARA GRADES PEQUENAS MAS A GRADE VAI PODER TER MILHÕES DE ESPAÇOS
	// ATRAVESSAR > 1MB DE TEXTO PARA VALIDAR INULTIMENTE UM JSON É UMA COISA DESNECESSÁRIA
	//context.JSON(http.StatusOK,gin.H{"width":simulation.GetWidth(),"height":simulation.GetHeight(),"grade":gradeb64})	

	var b bytes.Buffer

	b.WriteString("{\"width\":")
	b.WriteString(strconv.Itoa(simulation.GetWidth()))
	b.WriteString(",\"height\":")
	b.WriteString(strconv.Itoa(simulation.GetHeight()))
	b.WriteString(",\"grade\":\"")
	b.WriteString(gradeb64)
	b.WriteString("\"}")
	context.Data(http.StatusOK,"application/json",b.Bytes())
}

// DEBUG ONLY
func getGradeTxt(context *gin.Context) {
	var gradestr = simulation.ToString()
	context.Data(http.StatusOK,"text/html; charset=utf-8", []byte(gradestr))
}

func setGrade(context *gin.Context) {
	var x, errx = strconv.Atoi(context.Param("x"))
	var y, erry = strconv.Atoi(context.Param("y"))
	var value, errv = strconv.Atoi(context.Param("v"))

	if errx != nil || erry != nil || errv != nil{
		context.JSON(http.StatusBadRequest,gin.H{"error": "As coordenadas enviadas são inválidas"})
		return
	}

	if x >= simulation.GetWidth() || x < 0 || y >= simulation.GetHeight() || y < 0 {
		context.JSON(http.StatusBadRequest,gin.H{"error": "As coordenadas enviadas estão fora do intervalo da grade"})
		return
	}

	simulation.Set(x,y,value)
	
	context.JSON(http.StatusOK,gin.H{"status":"OK"})
}

func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }

        c.Next()
    }
}


func Main() {
	fmt.Println("Iniciando simulação da grade...")
	simulation.InitGrid(64,64)
	simulation.SetRandom()
	go simulation.RunSimulation(50) // 20 FPS

	router := gin.Default()
	router.Use(CORSMiddleware())
	router.GET("/", getIndex)

	router.GET("/grade", getGrade)

	// DEBUG ONLY
	router.GET("/gradetxt", getGradeTxt)

	router.POST("/grade/:x/:y/:v", setGrade)

	fmt.Println("Iniciando server na porta 9090...")
	router.Run("localhost:9090")
}