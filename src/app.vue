<template>
    <div class="bg-gray-900 pt-2 md:pt-1 pb-1 px-1 mt-0 h-auto fixed w-full z-20 top-0">
        <navbar></navbar>    
    </div>
    
    <div class="flex flex-col md:flex-row relative top-16">
        <div class="bg-gray-900 shadow-lg h-16 fixed bottom-0 mt-12 md:relative md:h-screen z-10 w-full md:w-0 hidden"></div>
        <div class="main-content flex-1 bg-gray-100">
            <router-view />
        </div>  
    </div>
    
</template>

<script lang="ts">
    import counter from './counter.vue';
    import navbar from './components/navbar.vue';
    import {defineComponent} from 'vue';
    
    export default defineComponent({
        components: {
            counter,
            navbar
        },
        setup() {
            
        }
    })
  
</script>