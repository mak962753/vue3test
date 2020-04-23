<template>
    <header class="flex items-center justify-around bg-gray-900 px-4 py-3">
        <div class="text-white">
            <SvgIcon icon-name="icon-status" width="24" height="24" fill="none" stroke="#fff" />
        </div>
        <div class="flex">
            <router-link class="lnk" to="/">home</router-link>
            <router-link class="lnk" to="/scene">scene</router-link>
            <router-link class="lnk" to="/about">about</router-link>
            <router-link class="lnk" to="/canv">canv</router-link>
        </div>
    </header>
</template>

<script>
    export default {
        name: "navbar"
    }
</script>

