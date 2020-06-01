<template>
    
    <div id="view">
        <div class="cursor cursor--outer"></div>
        <div class="cursor cursor--inner"></div>
        
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
        cursor: none;
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
                background-repeat: no-repeat;
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
        $cursor-color: #fff;
        .cursor {
            position: fixed;
            left: 0;
            top: 0;
            pointer-events: none;
            border-radius: 50%; 
        }
        .cursor--outer {
            width: 30px;
            height: 30px;
            border: 1px solid $cursor-color;
            z-index: 12000;
            opacity: 0.2; 
        }
        .cursor--inner {
            width: 5px;
            height: 5px;
            left: -2.5px;
            top: -2.5px;
            z-index: 11000;
            background: $cursor-color; 
        }
    }
</style>
