<template>
    <a @click="nav" :href="to"><slot /></a>
</template>

<script lang="ts">
    import {defineComponent} from 'vue';
    
    const props: any = {
        to: String
    };
    
    export default defineComponent({
        name: 'RouterLink',
        
        props,
        
        setup (props: any) {
            function nav(e: Event) {
                e.preventDefault();
                window.location.replace(`#${props.to}`);
            }
            
            return {
                nav
            };
        }
    });
</script>