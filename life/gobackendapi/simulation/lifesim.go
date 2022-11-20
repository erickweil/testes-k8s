package simulation

import (
	b64 "encoding/base64"
	"fmt"
	"math/rand"
	"strconv"
	"sync"
	"time"
)

/* Simulação Jogo da Vida
Simulação com Double-Buffering
- Inicia duas grades com tamanho especificado
- Calcula etapas em cópia da grade
- Atualiza referência da grade
*/

// Tabela das células 1 byte por célula
var grade BitGrid
var ugrade BitGrid
var txtgrade string // Cache
var gradew int
var gradeh int

// Em todo lugar que modifica a grade vai ser sincronizado
// De propósito vai fazer as requisições da api esperar um STEP completo
// LEMBRAR: SE UM MÉTODO FAZ O LOCK NÃO PODE CHAMAR OUTRO QUE FAÇA O LOCK DENOVO!!!!
var syncronized sync.Mutex
// Inicia a grade com *w* largura e *h* altura
func InitGrid(w int, h int) {
	fmt.Println("Iniciando grade...")

	// Cria duas grades porquê precisa de uma cópia
	grade = CreateGrid(w * h)
	ugrade = CreateGrid(w * h)
	gradew = w
	gradeh = h
}

func GetWidth() int { return gradew }
func GetHeight() int { return gradeh }

// Inicializa a grade com células aleatórias
func SetRandom() {
	syncronized.Lock()
	for y := 0; y < gradeh; y++ {
		for x := 0; x < gradew; x++ {
			//grade[y * gradew + x] = byte(rand.Intn(2))
			if rand.Intn(2) == 1 {
				grade.Set(y * gradew + x)
			}
		}
	}
	syncronized.Unlock()
}

func Set(x int, y int, value int) {
	//grade[y * gradew + x] = byte(value)
	syncronized.Lock()
	if value == 1 {
		grade.Set(y * gradew + x)
	} else {
		grade.UnSet(y * gradew + x)
	}
	syncronized.Unlock()
}

// Roda uma etapa da simulação
// grade --> A grade que receberá as modificações
// ugrade --> A grade com o estado parado no tempo
func Step() {
	syncronized.Lock()
	w := gradew
	h := gradeh

	// Swap, coloca a grade atualizada no ugrade
	// desta forma o loop sobrescreverá a grade antiga
	grade, ugrade = ugrade, grade

	// Limpa o cache base64
	txtgrade = ""

	// Loop começa em 1 e vai até == length
	// Feito desta forma por utilizar o resto da divisão
	// Assim (x-1) nunca dá negativo
	// E como usa resto da divisão quando chegar em length vai voltar pro zero
	for y := 1; y <= h; y++ {
		for x := 1; x <= w; x++ {
			// ler de ugrade, salvar em grade
			var index = (y%h) * w + (x%w)
			//var estado = ugrade[index]
			var estado = ugrade.Get(index)
			// Checar os vizinhos
			var vizinhos = 
			ugrade.Get((y-1)%h * w + (x-1)%w) +
			ugrade.Get((y-1)%h * w + (x+0)%w) +
			ugrade.Get((y-1)%h * w + (x+1)%w) +
			ugrade.Get((y+0)%h * w + (x-1)%w) +
			// 0,0
			ugrade.Get((y+0)%h * w + (x+1)%w) +
			ugrade.Get((y+1)%h * w + (x-1)%w) +
			ugrade.Get((y+1)%h * w + (x+0)%w) +
			ugrade.Get((y+1)%h * w + (x+1)%w)

			if vizinhos < 2 || vizinhos > 3{
				estado = 0
			}
			if vizinhos == 3 {
				estado = 1
			}

			//grade[index] = estado
			if estado == 1 {
				grade.Set(index)
			} else {
				grade.UnSet(index)
			}
		}
	}

	// ao fim do loop, grade terá a grade atualizada
	// e ugrade a grade antiga.
	syncronized.Unlock()
}

// String representation testing purposes only
func ToString() string {
	syncronized.Lock()
	rstring := make([]rune,(gradew+1)*gradeh)
	for y := 0; y < gradeh; y++ {
		for x := 0; x < gradew; x++ {
			var estado = grade.Get(y * gradew + x)
			if estado == 0 {
				rstring[y * (gradew+1) + x] = ' '
			} else {
				rstring[y * (gradew+1) + x] = rune(strconv.Itoa(int(estado))[0])
			}
		}
		rstring[y * (gradew+1) + gradew] = '\n'
	}
	syncronized.Unlock()
	return string(rstring)
}

func ToBase64() string {
	if txtgrade != "" { return txtgrade} // Se tem o cache retorna o cache

	syncronized.Lock()
	txtgrade = b64.StdEncoding.EncodeToString(grade)
	syncronized.Unlock()

	return txtgrade
}

func RunSimulation(sleepMillis int) {
	for {
		Step()

		// Sleep FORA do lock
		time.Sleep(time.Duration(sleepMillis) * time.Millisecond)
	}
}