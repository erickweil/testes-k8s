package api

import (
	"bytes"
	"encoding/json"
	"example/gobackendapi/simulation"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    //check origin will check the cross region source (note : please not using in production)
	CheckOrigin: func(r *http.Request) bool {
        //Here we just allow the chrome extension client accessable (you should check this verify accourding your client source)
		//return origin == "chrome-extension://cbcbkhdmedgianpaifchdaddpnmgnknn"
		return true
	},
}

func getIndex(context *gin.Context) {
	//upgrade get request to websocket protocol
	ws, err := upgrader.Upgrade(context.Writer, context.Request, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer ws.Close()
	var lastStepCont = -1
	for {
		//Read Message from client
		var mt, message, err = ws.ReadMessage()
		if err != nil {
			fmt.Println(err)
			break
		}

		//fmt.Println(string(message))

		var jsonResp map[string]string
		err = json.Unmarshal(message,&jsonResp);
		if err == nil {
			var req = jsonResp["req"]
			//fmt.Println(req,jsonResp)
			var resp []byte = nil
			switch req {
			case "getGrade":
				for lastStepCont == simulation.GetStepCount() {
					time.Sleep(1 * time.Millisecond)
				}
				lastStepCont = simulation.GetStepCount() 
				resp = doGetGrade(jsonResp["x0"],jsonResp["x1"],jsonResp["y0"],jsonResp["y1"])
				break
			case "setGrade":
				resp = doSetGrade(jsonResp["x"],jsonResp["y"],jsonResp["v"])
				break
			default:
				resp = []byte("{\"error\": \"Requisição desconhecida\"}")
				break
			}

			err = ws.WriteMessage(mt,resp)
			if err != nil {
				fmt.Println(err)
				break
			}
		} else {
			fmt.Println(err)
		}

		time.Sleep(1 * time.Millisecond)
		/**/
	}
	//context.JSON(http.StatusOK,gin.H{"status": "Você está perdido?"})
}

func doGetGrade(strx0 string, strx1 string, stry0 string, stry1 string) []byte {
	var gradeb64 string = ""
	var offx int = 0
	var offy int = 0
	var resx int = simulation.GetWidth()
	var resy int = simulation.GetHeight()

	var x0, _x0 = strconv.Atoi(strx0)
	var y0, _y0 = strconv.Atoi(stry0)
	var x1, _x1 = strconv.Atoi(strx1)
	var y1, _y1 = strconv.Atoi(stry1)

	if _x0 == nil && _x1 == nil && _y0 == nil && _y1 == nil {
		gradeb64 = simulation.ToBase64SubGrid(x0,y0,x1,y1)
		offx = x0
		offy = y0
		resx = x1-x0
		resy = y1-y0
	}
	

	// Sem parâmetros get
	if gradeb64 == "" {
		gradeb64 = simulation.ToBase64()
	}
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
	b.WriteString(",\"offx\":")
	b.WriteString(strconv.Itoa(offx))
	b.WriteString(",\"offy\":")
	b.WriteString(strconv.Itoa(offy))
	b.WriteString(",\"resx\":")
	b.WriteString(strconv.Itoa(resx))
	b.WriteString(",\"resy\":")
	b.WriteString(strconv.Itoa(resy))
	b.WriteString(",\"grade\":\"")
	b.WriteString(gradeb64)
	b.WriteString("\"}")

	return b.Bytes()
}

func getGrade(context *gin.Context) {
	var strx0,_x0 = context.GetQuery("x0")
	var stry0,_y0 = context.GetQuery("y0")
	var strx1,_x1 = context.GetQuery("x1")
	var stry1,_y1 = context.GetQuery("y1")

	if _x0 && _x1 && _y0 && _y1 {
		context.Data(http.StatusOK,"application/json",doGetGrade(strx0,strx1,stry0,stry1))
	} else {
		context.JSON(http.StatusOK,gin.H{"error": "Sem os parâmetros necessários"})
	}
}

// DEBUG ONLY
func getGradeTxt(context *gin.Context) {
	var gradestr = simulation.ToString()
	context.Data(http.StatusOK,"text/html; charset=utf-8", []byte(gradestr))
}

func doSetGrade(_x string, _y string, _value string) []byte {
	var x, errx = strconv.Atoi(_x)
	var y, erry = strconv.Atoi(_y)
	var value, errv = strconv.Atoi(_value)

	if errx != nil || erry != nil || errv != nil{
		return []byte("{\"error\": \"As coordenadas enviadas são inválidas\"}")
	}

	if x >= simulation.GetWidth() || x < 0 || y >= simulation.GetHeight() || y < 0 {
		return []byte("{\"error\": \"As coordenadas enviadas estão fora do intervalo da grade\"}")
	}

	simulation.Set(x,y,value)

	return []byte("{\"status\":\"OK\"}")
}

func setGrade(context *gin.Context) {
	var x = context.Param("x")
	var y = context.Param("y")
	var value = context.Param("v")

	context.Data(http.StatusOK,"application/json",doSetGrade(x,y,value))
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


func Main(width int,height int,sleep int) {
	fmt.Println("Iniciando simulação da grade...")
	simulation.InitGrid(width,height)
	simulation.SetRandom()
	go simulation.RunSimulation(sleep,true)

	router := gin.Default()
	router.Use(CORSMiddleware())
	router.GET("/", getIndex)

	router.GET("/grade", getGrade)

	// DEBUG ONLY
	router.GET("/gradetxt", getGradeTxt)

	router.POST("/grade/:x/:y/:v", setGrade)

	fmt.Println("Iniciando server na porta 9090...")
	router.Run("0.0.0.0:9090")
}