"""
ld42 running out of space
compo

Peter Quade

(Peterr)

"""

import pyxel

class App:
    def __init__(self):
        pyxel.init(256, 256)
        self.x = 0
        self.thing = pyxel.image(0).set(0, 0, ['ff1111111111111111111111111111ff',
                                               'f114444444444444444444444444411f',
                                               '11444444444444444444444444444411',
                                               '11444444444444444444444444444411',
                                               '14444444444444444444444444444441',
                                               '14444444444444444444444444444441',
                                               '14444444444444444444444444444441',
                                               '14444444444444444444444444444441',
                                               '14444444444444444444444444444441',
                                               '11111111111111111111111111111111',
                                               '1111ffffffffffffffffffffffff1111',
                                               '11ffffffffffffffffffffffffffff11',
                                               '11ffffffffffffffffffffffffffff11',
                                               '11fffffffffffff111ffffffffffff11',
                                               '11ffffffffff11111fffffffffffff11',
                                               'ffffffffff1111111fffffffffffffff',
                                               ])

        pyxel.sound(0).set('g1g1e1Re1e1   Rf1f1d1d1d1 c1d1e1f1g1g1g1', 't', '7', 'n', 25)
        self.sndplays = False
        pyxel.run(self.update, self.draw)

    def update(self):
        if not self.sndplays:
            pyxel.play(0,0)
            self.sndplays = True

        #self.x = (self.x + 1) % pyxel.width

    def draw(self):
        pyxel.cls(0)
        ts = 16 # thing size
        for y in range(256//ts):
            for x in range(256//ts):
                pyxel.rect(x*ts, y * ts, (x+1)*ts - 1, (y+1) * ts - 1, 6 + (1 if (x + (y % 2)) % 2 == 0 else 0))

        pyxel.blt(44, 44, 0, 0, 0, 2 * ts, ts, 0xf)

App()

