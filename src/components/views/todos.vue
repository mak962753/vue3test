<template>
    <h3>todos</h3>
    <div>
        
    </div>
    <div><input type="text" /> <button>add</button> </div>
</template>

<script lang="ts">
    import {defineComponent, ref} from 'vue';
    
    export default defineComponent({
        name: 'todos',
        setup() {
            const list = ref([]);
        }
    })
</script>
