<template>
    <component :is="currentComponent.component"></component>
</template>

<script lang="ts">
    import {reactive, computed, defineComponent, onMounted} from "vue";
    import {useRoutes, getPath} from '../index';

    
    export default defineComponent({
        name: 'RouterView',
        setup() {
            const routes = useRoutes();
            
            const current = reactive({
                path: getPath()
            });
            
            const currentComponent = computed(() => routes.find(r => r.path === current.path));
            onMounted(() => {
                window.addEventListener('popstate', () => {
                    current.path = getPath();
                });
            });
            
            return {
                current, 
                currentComponent
            };
        }
    })
</script>