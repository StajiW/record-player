import p5 from 'p5'

type Vector2 = [number, number]
type Vector3 = [number, number, number]

type Options = {
    position?: Vector3,
    rotation?: Vector3,
    fill?: p5.Color,
    noFill?: boolean,
    stroke?: p5.Color,
    strokeWeight?: number,
    noStroke?: boolean
    texture?: p5.Image,
}

export class Object {
    position: Vector3 = [0, 0, 0]
    rotation: Vector3 = [0, 0, 0]
    fill: p5.Color | null = null
    noFill: boolean = false
    stroke: p5.Color | null = null
    strokeWeight: number | null = null
    noStroke: boolean = false
    texture: p5.Image | null = null

    constructor(options?: Options) {
        if (!options) return

        if (options.position) this.position = options.position
        if (options.rotation) this.rotation = options.rotation
        if (options.fill) this.fill = options.fill
        if (options.noFill) this.noFill = options.noFill
        if (options.stroke) this.stroke = options.stroke
        if (options.strokeWeight) this.strokeWeight = options.strokeWeight
        if (options.noStroke) this.noStroke = options.noStroke
        if (options.texture) this.texture = options.texture
    }

    draw(p: p5, f?: () => void) {
        p.push()
        p.translate(...this.position)
        p.rotateX(this.rotation[0])
        p.rotateY(this.rotation[1])
        p.rotateZ(this.rotation[2])
        if (this.fill) p.fill(this.fill)
        if (this.noFill) p.noFill()
        if (this.stroke) p.stroke(this.stroke)
        if (this.strokeWeight) p.strokeWeight(this.strokeWeight)
        if (this.noStroke) p.noStroke()
        if (this.texture) p.texture(this.texture)
        if (f) f()
        p.pop()
    }
}

export class Collection extends Object {
    children: Object[]

    constructor(children: Object[], options?: Options) {
        super(options)
        this.children = children
    }

    draw(p: p5) {
        super.draw(p, () => {
            this.children.forEach(child => child.draw(p))
        })
    }
}

export class Box extends Object {
    size: Vector3

    constructor(size: Vector3, options?: Options) {
        super(options)
        this.size = size
    }

    draw(p: p5) {
        super.draw(p, () => {
            p.box(...this.size)
        })
    }
}

export class Cylinder extends Object {
    size: Vector2

    constructor(size: Vector2, options?: Options) {
        super(options)
        this.size = size
    }

    draw(p: p5) {
        super.draw(p, () => {
            p.cylinder(...this.size)
        })
    }
}

export class Circle extends Object {
    radius: number

    constructor(radius: number, options?: Options) {
        super(options)
        this.radius = radius
    }

    draw(p: p5) {
        super.draw(p, () => {
            p.ellipse(0, 0, this.radius)
        })
    }
}