import p5 from 'p5'

export class AnimationPlayer {
    sequence: Sequence | null = null
    index: number = 0
    time: number = 0

    play(sequence: Sequence) {
        if (sequence.length > 0) {
            this.sequence = sequence
            this.index = 0
            this.time = 0
        }
    }

    step(p: p5) {
        if (!this.sequence) return

        
        
        let onGoing = false
        const transitions = this.sequence[this.index]

        for (let i = 0; i < transitions.length; i++) {
            const res = this.transitionStep(transitions[i])
            if (res) onGoing = true
        }

        if (!onGoing) {
            this.index++
            this.time = 0

            if (this.index >= this.sequence.length) {
                this.sequence = null
            }
        }

        this.time += p.deltaTime / 1000
    }

    transitionStep(transition: Transition): boolean {
        if (this.time < (transition.delay || 0)) return true
        const time = this.time - (transition.delay || 0)
        if (time > transition.duration) return false

        if (transition.from === undefined) transition.from = transition.variable.value
        transition.variable.value = this.getSmoothValue(transition.from, transition.to, time / transition.duration)
        
        return true
    }

    getSmoothValue(start: number, end: number, t: number) {
        // https://easings.net/#easeInOutCubic
        const val = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        const diff = end - start
        return start + diff * val
    }
}

export class Animatable {
    value: number

    constructor(value: number) {
        this.value = value
    }
}

enum Timing {
    Linear,
    Smooth
}

export type Sequence = Transition[][]

export type Transition = {
    variable: Animatable,
    from?: number,
    to: number,
    duration: number,
    delay?: number,
    timing?: Timing
}