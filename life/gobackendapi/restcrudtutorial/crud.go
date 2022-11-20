package restcrudtutorial

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type todo struct {
	ID			string `json:"id"`
	Item		string `json:"item"`
	Completed	bool `json:"completed"`
}

var todos = []todo{
	{ID: "1", Item: "Clean room", Completed: false},
	{ID: "2", Item: "Read Book", Completed: false},
	{ID: "3", Item: "Record Video", Completed: false},
}

func getIndex(context *gin.Context) {
	context.JSON(http.StatusOK,gin.H{"message": "Teste com GoLang"})
}

func todo_byID(id string) (*todo, error) {
	for i, t := range todos {
		if t.ID == id {
			return &todos[i], nil
		}
	}

	return nil,errors.New("todo not found")
}

func getTodo(context *gin.Context) {
	context.JSON(http.StatusOK,todos)	
}

func getTodoID(context *gin.Context) {
	var id = context.Param("id")

	var t,err = todo_byID(id)
	if err != nil {
		context.JSON(http.StatusNotFound,gin.H{"message": "Não encontrado"})
		return
	}

	context.JSON(http.StatusOK,t)
}

func patchTodoID(context *gin.Context) {
	var id = context.Param("id")

	var t,err = todo_byID(id)
	if err != nil {
		context.JSON(http.StatusNotFound,gin.H{"message": "Não encontrado"})
		return
	}

	t.Completed = !t.Completed

	context.JSON(http.StatusOK, t)
}

func addTodo(context *gin.Context) {
	var newTodo todo

	if err := context.BindJSON(&newTodo); err != nil {
		context.JSON(http.StatusBadRequest,gin.H{"message": "Json inválido"})
		return
	}

	todos = append(todos, newTodo)

	context.JSON(http.StatusCreated,newTodo)	
}

func Main() {
	router := gin.Default()
	router.GET("/", getIndex)


	router.GET("/todos", getTodo)
	router.GET("/todos/:id", getTodoID)
	router.PATCH("/todos/:id", patchTodoID)
	router.POST("/todos", addTodo)

	fmt.Println("Iniciando server na porta 9090...")
	router.Run("localhost:9090")
}