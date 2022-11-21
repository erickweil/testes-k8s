package simulation

// Grade que utiliza os bits individuais de bytes para os valores 0 e 1
type BitGrid []byte

func CreateGrid(length int) BitGrid {
	var ret = make(BitGrid, (length+7)/8)
	return ret
}

func (self BitGrid) Get(index int) byte {
	var rindex = index / 8
	var bindex = index % 8

	var ret = self[rindex] & (byte(1) << bindex)
	return ret >> bindex
}

func (self BitGrid) Set(index int) {
	var rindex = index / 8
	var bindex = index % 8
	self[rindex] |= (byte(1) << bindex)
}

func (self BitGrid) UnSet(index int) {
	var rindex = index / 8
	var bindex = index % 8
	self[rindex] &= ^(byte(1) << bindex)
}
