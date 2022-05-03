<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Sketch from './scripts/sketch'
import io from 'socket.io-client'
import p5 from 'p5'

const canvasWrapper = ref()

onMounted(async () => {
    await login()
    const sketch = new Sketch()
    new p5(sketch.sketch, canvasWrapper.value)

    const socket = io(':4001')
    socket.on('songChange', data => {
        sketch.loadCover(data.song.cover, data.progress)
    })
    socket.on('progress', data => {
        sketch.setProgress(data)
    })
})

async function login() {
    const res = await fetch('/api/spotify/loggedin')
    if (res.status === 404) window.location.replace('/api/spotify/login')
}
</script>

<template>
<div id='canvasWrapper' ref='canvasWrapper'></div>
</template>

<style>
html, body {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

#canvasWrapper {
    margin: 0;
    width: 100%;
    height: 100%;
}
</style>
