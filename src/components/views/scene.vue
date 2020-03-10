<template>
    <div id="view">
    </div> 
</template>

<script lang="ts">
    import {defineComponent, onMounted, onUnmounted} from 'vue';


    import {IScene, init} from './scene/scene';


    export default defineComponent({
        name: 'scene',
        setup() {
            let scene: IScene | null = null;
            onMounted(function (){
                scene = init();
            });
            onUnmounted(function () {
                if(scene) {
                    scene.dispose();
                    scene = null;
                }
            });
            return {};
        }
    })
</script>

<style>
    
</style>
