<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Sketch from './scripts/sketch'
import io from 'socket.io-client'
import p5 from 'p5'

const canvasWrapper1 = ref()
// const canvasWrapper2 = ref()

onMounted(async () => {
    await login()
    const sketch1 = new Sketch()
    // const sketch2 = new Sketch()
    new p5(sketch1.sketch, canvasWrapper1.value)
    // new p5(sketch2.sketch, canvasWrapper2.value)

    const socket = io(':4001')
    socket.on('songChange', data => {
        sketch1.loadCover(data.song.cover, data.progress)
        // sketch2.loadCover(data.song.cover, data.progress)
    })
    socket.on('progress', data => {
        sketch1.setProgress(data)
        // sketch2.setProgress(data)
    })
})

async function login() {
    const res = await fetch('/api/spotify/loggedin')
    if (res.status === 404) window.location.replace('/api/spotify/login')
}
</script>

<template>
<div class='CanvasWrapper' id='canvasWrapper1' ref='canvasWrapper1'></div>
<!-- <div class='CanvasWrapper' id='canvasWrapper2' ref='canvasWrapper2'></div> -->
<!-- <div id='songInfo'>
    <div id='primary'>Alfa Mist - Breathe</div>
    <div id='secondary'>Antiphon (2017)</div>
</div> -->
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Libre+Bodoni:wght@500&display=swap');

html, body {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;

    user-select: none;
}

.CanvasWrapper {
    display: inline-block;
    margin: 0;
    /* width: 50% !important; */
    height: 100%;
    overflow: hidden;
}


#canvasWrapper2 canvas {
    margin-left: -100%;
}

#songInfo {
    position: absolute;
    left: 50%;
    top: 80%;
    transform: translate(-50%, 50%);
    text-align: center;

    font-family: 'Libre Bodoni', serif;
}

#songInfo #primary {
    font-size: 40px;
}

#songInfo #secondary {
    font-size: 32px;
}

</style>
