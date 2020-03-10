<template>
    <svg xmlns="http://www.w3.org/2000/svg" role="presentation" v-bind="attrs">
        <use v-if="useIconPath" :href="useIconPath" />
        <g v-else>
            <slot />
        </g>
    </svg>
</template>

<script lang="ts">
    import {defineComponent, computed} from 'vue';
    
    const props = {
        iconName: String
    };
    
    export default defineComponent({
        props,
        setup(props, ctx) {
            const useIconPath =  computed(() => Boolean(props.iconName) ? `assets/icons.svg#${props.iconName}`: null);
            return {
                useIconPath,
                attrs: ctx.attrs
            };
        }
    })
</script>
