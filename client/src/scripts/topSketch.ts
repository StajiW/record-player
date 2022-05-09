import p5 from "p5"

export class TopSketch {
    recordRotation: number = 0

    backgroundColor: Color = [255, 255, 255]
    lineColor: Color = [0, 0, 0]
    cover: p5.Image | null = null

    
}

type Color = [number, number, number]