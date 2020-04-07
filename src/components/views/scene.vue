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
                scene.init();
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
        .menu-item {
            position: absolute;
            width: 300px;
            height: 100px;

            /*background: #fff6;*/
            h1 {
                font-weight: bold;
                font-size: 16px;
                color: #fff;
            }
            &__icon {
                width: 93px;
                height: 100px;
                background: url('/assets/scene/1.svg') no-repeat;
                position: absolute;
                left: -20px;
                top: 50%;
                transform: translateY(-50%);
            }
            &__text {
                margin-left: 80px;
                font-size: 12px;
                font-weight: bold;
                color: rgb(189,124,144);
            }
        }
    }
</style>
