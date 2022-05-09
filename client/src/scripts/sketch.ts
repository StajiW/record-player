import p5 from 'p5'
import ColorThief from 'colorthief'
const colorThief = new ColorThief()
import { Collection, Box, Cylinder, Circle } from './primitives'
import { Animatable, Sequence, AnimationPlayer  } from './animation'
import { Color }  from './util'

const frameRate = 60

export default class Sketch {
    p: p5 | null = null
    animationPlayer: AnimationPlayer = new AnimationPlayer()

    backgroundColor: Animatable<Color> = new Animatable([255, 255, 255])
    lineColor: Animatable<Color> = new Animatable([0, 0, 0])
    progress: number = 0

    recordSpin: number = 0
    tempRecordSpin: number = 0
    record: Vinyl = new Vinyl(this.backgroundColor.value, this.lineColor.value)
    tempRecord: Vinyl | null = new Vinyl(this.lineColor.value, this.backgroundColor.value)

    recordPositionY:    Animatable<number> = new Animatable(-10)
    recordRotationX:    Animatable<number> = new Animatable(Math.PI / 2)
    recordSpeed:        Animatable<number> = new Animatable(1)
    pinHeight:          Animatable<number> = new Animatable(-10)
    armPosition:        Animatable<number> = new Animatable(-0.22)
    armHeight:          Animatable<number> = new Animatable(-0.06)
    animation = (newBackgroundColor: Color, newlineColor: Color) => { return [
        [
            { variable: this.recordSpeed, to: 0, duration: 0.8 },
            { variable: this.armHeight, to: 0, duration: 0.3, delay: 0.6 }
        ],
        [
            { variable: this.armPosition, to: 0, duration: 1 },
            { variable: this.armHeight, to: -0.06, duration: 0.3, delay: 0.7 },
            { variable: this.pinHeight, to: 10, duration: 1 }
        ],
        [
            { variable: this.recordPositionY, to: -100, duration: 1.2 },
            { variable: this.recordRotationX, to: this.recordRotationX.value - Math.PI, duration: 1.5, delay: 0.2 },
            { variable: this.recordPositionY, to: 0, duration: 0.3, delay: 1.5 }
        ], [
            { variable: this.recordPositionY, to: -10, duration: 0.3  },
            { variable: this.backgroundColor, to: newBackgroundColor, duration: 0.3 },
            { variable: this.lineColor, to: newlineColor, duration: 0.3 }
        ],
        [
            { variable: this.armHeight, to: 0, duration: 0.3 },
            { variable: this.armPosition, to: -0.22, duration: 1 },
            { variable: this.pinHeight, to: -10, duration: 1 }
        ],
        [
            { variable: this.armHeight, to: -0.06, duration: 0.3 },
        ],
        [
            { variable: this.recordSpeed, to: -1, duration: 0.8 }
        ]
    ]}




    loadCover = (coverUrl: string, progress: number) => {
        if (!this.p) return

        let cover: p5.Image | null = null
        let backgroundColor: Color | null = null
        let lineColor: Color | null = null

        this.p.loadImage(coverUrl, image => {
            cover = image

            if (backgroundColor && lineColor) {
                this.updateCover(cover, backgroundColor, lineColor)
            }
        })

        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.src = coverUrl
        img.onload = () => {
            if (!this.p) return
            const palette: Color[] = colorThief.getPalette(img)

            if (this.p.saturation(palette[0]) > this.p.saturation(palette[1])) {
                backgroundColor = palette[0]
                lineColor = palette[1]
            }
            else {
                backgroundColor = palette[1]
                lineColor = palette[0]
            }

            if (cover) {
                this.updateCover(cover, backgroundColor, lineColor)
            }
        }
    }

    updateCover(cover: p5.Image, backgroundColor: Color, lineColor: Color) {
        this.tempRecordSpin = -this.recordSpin
        this.tempRecord = new Vinyl(backgroundColor, lineColor, cover)

        this.animationPlayer.play(this.animation(backgroundColor, lineColor), () => {
            if (this.tempRecord) {
                this.record = this.tempRecord
                this.recordRotationX.value = Math.PI / 2
                this.recordSpeed.value = 1
                this.recordSpin = this.tempRecordSpin
            }
            this.tempRecord = null
        })
    }

    setProgress = (progress: number) => {
        this.progress = progress
    }

    sketch = (p: p5) => {
        this.p = p

        p.setup = () => {
            p.createCanvas(p.windowWidth, p.windowHeight, 'webgl')
            p.frameRate(frameRate)
        }

        p.draw = () => {
            p.background(this.backgroundColor.value)
            p.scale(2)
            

            this.animationPlayer.step(p)

            this.recordSpin += p.deltaTime / 1000 / 60 * 33.33 * this.recordSpeed.value
            this.tempRecordSpin -= p.deltaTime / 1000 / 60 * 33.33 * this.recordSpeed.value
            
            const player = new Collection([
                new Box([220, 20, 200], { noFill: true, strokeWeight: 5 }),
                // Pin
                new Cylinder([1, 8], { position: [-10, this.pinHeight.value, 0], fill: this.backgroundColor.value, noStroke: true }),
                // Vinyl
                this.record,
                this.tempRecord ? this.tempRecord : null,
                // Arm
                new Collection([
                    new Cylinder([10, 5], { position: [0, -2.5, 0] }),
                    new Cylinder([3, 8], { position: [0, -9, 0] }),
                    new Collection([
                        new Cylinder([2, 140], { position: [0, 0, 60], rotation: [p.HALF_PI, 0, 0] }),
                        new Cylinder([5, 8], { position: [0, 0, -10], rotation: [p.HALF_PI, 0, 0] }),
                        new Box([6, 3, 12], { position: [0, 2, 60 + 140 / 2 - 12 / 2] })
                    // ], { position: [0, -10, 0], rotation: [-0.06, p.map(0, 0, 1, -0.23, -0.65), 0] })
                    ], { position: [0, -10, 0], rotation: [this.armHeight.value, this.armPosition.value, 0] })
                ], { position: [90, -10, -80], fill: this.lineColor.value, noStroke: true })
            ], {
                rotation: [-0.4, -0.2, 0],
                stroke: this.lineColor.value
            })

            this.record.update(this.recordSpin, this.recordPositionY.value, this.recordRotationX.value)
            if (this.tempRecord) {
                this.tempRecord.update(this.tempRecordSpin, this.recordPositionY.value, this.recordRotationX.value + p.PI)
            }
            
            player.draw(p)
        }

        p.windowResized = () => {
            p.resizeCanvas(p.windowWidth, p.windowHeight)
        }
    }
}

class Vinyl extends Collection {
    constructor(backgroundColor: Color, lineColor: Color, cover?: p5.Image) {
        super([
            new Circle(180, { fill: cover ? undefined : backgroundColor, texture: cover || undefined, position: [0, 0, 0.01], stroke: lineColor, strokeWeight: 8 }),
            new Circle(55, { fill: backgroundColor, position: [0, 0, 0.02], noStroke: true }),
            new Circle(50, { fill: lineColor, position: [0, 0, 0.03], noStroke: true }),
            new Circle(3, { fill: backgroundColor, position: [0, 0, 0.04], noStroke: true })
        ])
    }

    update(spin: number, positionY: number, rotationX: number) {
        this.position = [-10, positionY, 0]
        this.rotation = [rotationX, 0, spin]
    }
}