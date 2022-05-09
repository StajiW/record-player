import p5 from 'p5'

export class AnimationPlayer {
    sequence: Sequence | null = null
    index: number = 0
    time: number = 0
    callback: (() => any) | null = null

    play(sequence: Sequence, callback?: () => any) {
        // Don't allow 2 animations at the same time
        if (this.sequence !== null) return

        if (sequence.length === 0) return
            
        this.sequence = sequence
        this.index = 0
        this.time = 0
        if (callback) this.callback = callback
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
                if (this.callback) this.callback()
            }
        }

        this.time += p.deltaTime / 1000
    }

    // This is now officially a dirty hack
    transitionStep(transition: Transition): boolean {
        if (this.time < (transition.delay || 0)) return true
        const time = this.time - (transition.delay || 0)
        if (time > transition.duration) return false

        if (transition.from === undefined) transition.from = transition.variable.value

        if (Array.isArray(transition.from) && Array.isArray(transition.to)) {
            if (transition.from.length !== transition.to.length) throw 'array length mismatch'
            if (!Array.isArray(transition.variable.value)) throw 'array / variable mismatch'

            for (let i = 0; i < transition.from.length; i++) {
                transition.variable.value[i] = this.getSmoothValue(transition.from[i], transition.to[i], time / transition.duration)
            }
        }
        else if (!Array.isArray(transition.from) && !Array.isArray(transition.to)) {
            if (Array.isArray(transition.variable.value)) throw 'array / variable mismatch'
            transition.variable.value = this.getSmoothValue(transition.from, transition.to, time / transition.duration)
        }
        else {
            throw 'array / variable mismatch'
        }
        
        return true
    }

    getSmoothValue(start: number, end: number, t: number) {
        // https://easings.net/#easeInOutCubic
        const val = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        const diff = end - start
        return start + diff * val
    }
}

export class Animatable<X> {
    value: X

    constructor(value: X) {
        this.value = value
    }
}

type X = number | number[]

enum Timing {
    Linear,
    Smooth
}

export type Sequence = Transition[][]

export type Transition = {
    variable: Animatable<X>,
    from?: number | number[],
    to: number | number[],
    duration: number,
    delay?: number,
    timing?: Timing
}