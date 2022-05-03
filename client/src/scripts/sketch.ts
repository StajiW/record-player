import p5 from 'p5'
import ColorThief from 'colorthief'
const colorThief = new ColorThief()
import { Collection, Box, Cylinder, Circle } from './primitives'
import { Animatable, Sequence, AnimationPlayer, Transition  } from './animation'

const frameRate = 60

type Color = [number, number, number]

export default class Sketch {
    p: p5 | null = null
    animationPlayer: AnimationPlayer = new AnimationPlayer()

    backgroundColor: Color = [255, 255, 255]
    lineColor: Color = [0, 0, 0]
    progress: number = 0
    cover: p5.Image | null = null


    recordPositionY: Animatable = new Animatable(-10)
    recordRotationX: Animatable = new Animatable(Math.PI / 2)
    recordSpeed: Animatable = new Animatable(1)
    pinHeight: Animatable = new Animatable(-10)
    armPosition: Animatable = new Animatable(-0.22)
    armHeight: Animatable = new Animatable(-0.06)
    animation: Sequence = [
        [
            { variable: this.recordSpeed, to: 0, duration: 0.5 }
        ],
        [
            { variable: this.armHeight, to: 0, duration: 0.3 }
        ],
        [
            { variable: this.armPosition, to: 0, duration: 1 },
            { variable: this.armHeight, to: -0.06, duration: 0.3, delay: 0.7 },
            { variable: this.pinHeight, to: 10, duration: 1 }
        ],
        [
            { variable: this.recordPositionY, to: -100, duration: 1 },
            { variable: this.recordRotationX, to: this.recordRotationX.value - Math.PI, duration: 1.5, delay: 0.25 },
            { variable: this.recordPositionY, to: 0, duration: 0.6, delay: 1.4 }
        ], [
            { variable: this.recordPositionY, to: -10, duration: 0.3  }
        ],
        [
            { variable: this.armHeight, to: 0, duration: 0.3 },
            { variable: this.armPosition, to: -0.22, duration: 1 },
            { variable: this.pinHeight, to: -10, duration: 1 }
        ],
        [
            { variable: this.armHeight, to: -0.06, duration: 0.3 }
        ],
    ]




    loadCover = (coverUrl: string, progress: number) => {
        if (!this.p) return

        let cover: p5.Image | null = null
        let backgroundColor: Color | null = null
        let lineColor: Color | null = null

        this.p.loadImage(coverUrl, image => {
            cover = image

            if (backgroundColor && lineColor) {
                this.cover = cover
                this.backgroundColor = backgroundColor
                this.lineColor = lineColor
                this.progress = progress
                setTimeout(() => this.animationPlayer.play(this.animation), 1000)
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
                this.cover = cover
                this.backgroundColor = backgroundColor
                this.lineColor = lineColor
                this.progress = progress
                setTimeout(() => this.animationPlayer.play(this.animation), 1000)
            }
        }
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
            const backgroundColor = p.color(this.backgroundColor)
            const lineColor = p.color(this.lineColor)

            p.background(this.backgroundColor)
            p.scale(2)

            this.animationPlayer.step(p)
            
            const collection = new Collection([
                new Box([220, 20, 200], { noFill: true, strokeWeight: 5 }),
                // Pin
                new Cylinder([1, 8], { position: [-10, this.pinHeight.value, 0], fill: backgroundColor, noStroke: true }),
                // Vinyl
                new Collection([
                    new Circle(55, { fill: backgroundColor, position: [0, 0, -0.02], noStroke: true }),
                    new Circle(50, { fill: lineColor, position: [0, 0, -0.03], noStroke: true }),
                    new Circle(3, { fill: backgroundColor, position: [0, 0, -0.04], noStroke: true }),
                    new Circle(180, { fill: this.cover ? undefined : p.color(255), texture: this.cover || undefined, position: [0, 0, 0.01], strokeWeight: 8 }),
                    new Circle(55, { fill: backgroundColor, position: [0, 0, 0.02], noStroke: true }),
                    new Circle(50, { fill: lineColor, position: [0, 0, 0.03], noStroke: true }),
                    new Circle(3, { fill: backgroundColor, position: [0, 0, 0.04], noStroke: true })
                ], { position: [-10, this.recordPositionY.value, 0], rotation: [this.recordRotationX.value, 0, p.frameCount * (1 / frameRate) / 60 * 33.33] }),
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
                ], { position: [90, -10, -80], fill: lineColor, noStroke: true })
            ], {
                rotation: [-0.4, 0.001 * p.frameCount, 0],
                stroke: lineColor
            })
            
            collection.draw(p)
        }

        p.windowResized = () => {
            p.resizeCanvas(p.windowWidth, p.windowHeight)
        }
    }
}
