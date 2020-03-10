<template>
    <div class="flex">
        <div>{{plusOne}}</div>
        <button @click="inc" class="bg-white p-2">Clicked1 {{count}}</button>
    </div>
</template>

<script lang="ts">
    import {ref, computed, defineComponent } from 'vue';

    export default defineComponent({
        setup() {
            const count = ref(0);
            const plusOne = computed(() => count.value + 1);
            const inc = () => {
                count.value++;
            };
            return {
                count,
                inc,
                plusOne
            }
        }
    })
</script>