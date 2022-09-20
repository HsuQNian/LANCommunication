<template>
  <div id="app">
    <transition name="route" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script>
export default {
  name: "App",
  created() {
    // 页面加载时，读取sessionStorage中的状态信息
    if (sessionStorage.getItem("store")) {
      this.$store.replaceState(
        Object.assign(
          {},
          this.$store.state,
          JSON.parse(sessionStorage.getItem("store"))
        )
      );
    }
    window.addEventListener("beforeunload", () => {
      sessionStorage.setItem("store", JSON.stringify(this.$store.state));
    });
  },
};
</script>
<style>
::-webkit-scrollbar {
  display: none;
}

#app {
  border-radius: 18px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  user-select: none;
  background: hsl(240, 24%, 94%);
  /* overflow: hidden; */
}
.route-enter-active,
.route-leave-active {
  transition: all 0.36s ease;
}

.route-enter,
.route-leave-to {
  opacity: 0;
}
@media screen and (min-width: 800px), screen and (min-height: 640px) {
  #app {
    border-radius: 0;
  }
}
</style>
