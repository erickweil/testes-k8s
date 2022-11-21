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
var sgrade BitGrid // Subgrid Cache
var txtgrade string // Cache
var gradew int
var gradeh int
var stepCount int


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
	sgrade = CreateGrid(w * h)
	gradew = w
	gradeh = h
}

func GetWidth() int { return gradew }
func GetHeight() int { return gradeh }
func GetStepCount() int {return stepCount }
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

// Roda Steps em sub-grades de forma paralela
// considerar que o tamanho da subgrade deve ser múltiplo de 8 para dar certo!!!
// Depois tinha que testar e ver se realmente isso não está com problemas
func MultithreadedStep(cores int) {
	syncronized.Lock()
	w := gradew
	h := gradeh

	// Swap, coloca a grade atualizada no ugrade
	// desta forma o loop sobrescreverá a grade antiga
	grade, ugrade = ugrade, grade
	// Limpa o cache base64
	txtgrade = ""

	wcore := w / cores

	var wg sync.WaitGroup
	wg.Add(cores)
	for i := 0; i < cores; i++ {
		go func(i int) {
			SubStep((i*wcore)+1,1,(i*wcore)+wcore+1,h+1)
			wg.Done()
		}(i)
	}
	wg.Wait()

	syncronized.Unlock()
}

func Step() {
	syncronized.Lock()
	w := gradew
	h := gradeh

	// Swap, coloca a grade atualizada no ugrade
	// desta forma o loop sobrescreverá a grade antiga
	grade, ugrade = ugrade, grade

	// Limpa o cache base64
	txtgrade = ""
	SubStep(1,1,w+1,h+1)
	syncronized.Unlock()
}

// Roda uma etapa da simulação (DEVE SER CHAMADO DE ALGO SINCRONIZADO JÁ)
// grade --> A grade que receberá as modificações
// ugrade --> A grade com o estado parado no tempo
func SubStep(startx int, starty int, endx int, endy int) {	
	// Loop começa em 1 e vai até == length
	// Feito desta forma por utilizar o resto da divisão
	// Assim (x-1) nunca dá negativo
	// E como usa resto da divisão quando chegar em length vai voltar pro zero
	w := gradew
	h := gradeh
	for y := starty; y < endy; y++ {
		for x := startx; x < endx; x++ {
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

func ToBase64SubGrid(x0 int, y0 int, x1 int, y1 int) string {
	var w = x1 - x0
	var h = y1 - y0
	if w <= 0 || h <= 0 || w > gradew || h > gradeh {return ""}

	if x0 < 0 || y0 < 0 || x1 < 0 || y1 < 0 ||
	   x0 > gradew || y0 > gradeh || x1 > gradew || y1 > gradeh {
		return ""
	}

	if w == gradew && h == gradeh {
		return ToBase64()
	}

	// Será que deveria criar um slice de um array compartilhado ao invés de criar um novo slice cada request?
	// E a concorrência entre os requests como fica, teria que sincroniza daí né?
	//var subgrid = CreateGrid(w * h)
	syncronized.Lock()
	var subgrid = sgrade[0:((w*h+7)/8)]
	// Copiar a grade para a subgrade
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			var estado = grade.Get((y+y0) * gradew + (x+x0))
			if estado != 0 {
				subgrid.Set(y * w + x)
			} else {
				subgrid.UnSet(y * w + x)
			}
		}
	}
	var txtsubgrade = b64.StdEncoding.EncodeToString(subgrid)
	syncronized.Unlock()

	return txtsubgrade
}

func ToBase64() string {
	if txtgrade != "" { return txtgrade} // Se tem o cache retorna o cache

	// Como o txtgrade é setado dentro do syncronized, não tem como dar problema
	syncronized.Lock()
	txtgrade = b64.StdEncoding.EncodeToString(grade)
	syncronized.Unlock()

	return txtgrade
}

func RunSimulation(sleepMillis int, multithreaded bool) {
	stepCount = 0
	for {
		start := time.Now()
		//Step()
		if multithreaded {
			if gradew % 16 == 0 && (gradew / 16) % 8 == 0 {
				MultithreadedStep(16)
			} else if gradew % 8 == 0 && (gradew / 8) % 8 == 0 {
				MultithreadedStep(8)
			} else if gradew % 4 == 0 && (gradew / 4) % 8 == 0 {
				MultithreadedStep(4)
			} else {
				Step()
			}
		} else {
			Step()
		}
		stepCount++
		elapsed := time.Since(start)

		if stepCount % 100 == 0 {
			fmt.Printf("Step %d Elapsed:%s\n",stepCount,elapsed)
		}
		// Sleep FORA do lock
		time.Sleep(time.Duration(sleepMillis) * time.Millisecond)
		
	}
}