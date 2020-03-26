<template>
    
    <div id="view">
    </div> 
</template>

<script lang="ts">
    import {defineComponent, onMounted, onUnmounted} from 'vue';
    import {initParallax} from './scene/parallax';
    import {IScene, init} from './scene/scene';


    export default defineComponent({
        name: 'scene',
        setup() {
            let scene: IScene | null = null;
            let disposeParallax: {(): void} | null = null; 
            onMounted(function (){
                scene = init('view');
                disposeParallax = initParallax('view');
            });
            onUnmounted(function () {
                if (scene) {
                    scene.dispose();
                    scene = null;
                }
                disposeParallax && disposeParallax();
            });
            return {};
        }
    })
</script>

<style lang="scss">
    [id=view] {
        position: relative;
        width: 100%;
        background-image: url('/assets/scene/Layer-4.png'), url('/assets/scene/Layer-3.png'), url('/assets/scene/Layer-2.png'), url('/assets/scene/Layer-1.png');
        background-repeat: no-repeat;
        background-position: center;
        
        /*background-position: 50% 50%;*/
    }
</style>
