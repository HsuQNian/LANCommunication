<script>
export default {
  name: "blOck",
  data: () => {
    return {};
  },
  props: {
    name: String,
    current: Boolean,
    equipment: String,
    code: String,
  },
  methods: {
    details() {
      if (!this.current)
        switch (this.equipment) {
          case "controller":
            this.$router.push({
              name: "chat",
              params: {
                name: this.name,
                other: this.code,
              },
            });
            setTimeout(() => {
              this.$store.commit("clearUnread", this.code);
            }, 400);
            break;
          case "controllable":
            if (this.$refs.button) {
              this.$ws.ws.send(
                JSON.stringify({
                  instruction: {
                    code: this.code,
                    control: !this.$store.state.ooc[this.code]
                      ? "open"
                      : "close",
                  },
                })
              );
              // this.$refs.button.style.background = !this.$store.state.ooc[
              //   this.code
              // ]
              //   ? "url(img/switch_open.png) no-repeat center"
              //   : "url(img/switch_close.png) no-repeat center";
              // this.$refs.button.style.boxShadow = !this.$store.state.ooc[
              //   this.code
              // ]
              //   ? "-6px -6px 10px #ffffff, 6px 6px 10px hsl(240, 30%, 86%),inset -6px -6px 10px #ffffff, inset 6px 6px 10px hsl(240, 30%, 86%)"
              //   : "-6px -6px 10px #ffffff, 6px 6px 10px hsl(240, 30%, 86%)";
              this.$store.commit("inversion", this.code);
            }
            break;
          default:
            break;
        }
    },
  },
  computed: {
    ooc() {
      return this.$store.state.ooc[this.code];
    },
    charNameS() {
      let charName;
       this.$store.state.equipment.forEach((item) => {
        if (item.name == this.name) charName= item.name;
      });
      return charName;
    },
  },
};
</script>

<template>
  <div id="block" @click="details">
    <div id="information">
      <div id="name">{{ charNameS }}</div>
      <div id="current" style="font-size: 0.8rem">
        {{ current ? "当前设备" : "" }}
      </div>
    </div>
    <div
      style="
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
      "
    >
      <div
        :id="equipment == 'controller' ? 'unread' : 'switch'"
        :class="equipment == 'controller' ? '' : ooc ? 'open' : 'close'"
        ref="button"
      >
        {{ this.$store.state.unread[this.code]?.length || "" }}
      </div>
    </div>
  </div>
</template>

<style scoped>
#block {
  -webkit-app-region: no-drag;
  width: 264px;
  height: 120px;
  background-color: hsl(240, 26%, 95%);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: -6px -6px 20px #ffffff, 6px 6px 20px hsl(240, 30%, 86%);
  transition: all 0.2s ease;
}

#block:hover #name {
  color: #a2ddb8;
}

#block div {
  flex: 1;
}

#block:hover {
  box-shadow: -6px -6px 20px #ffffff, 6px 6px 12px #a2ddb8;
}
/* #button:hover {
  box-shadow: 4px 4px 16px rgba(32, 241, 158, 0.4),
    -4px -4px 16px rgba(31, 126, 88, 0.068);
} */
#name {
  transition: all 0.2s ease;
  font-size: 24px;
  color: #2c3e50;
}

#information {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#unread {
  color: #a2ddb8;
  font-size: 24px;
}
#switch {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.4s ease;
  position: absolute;
  margin: 10px;
  right: 0;
  top: 0;
  border: 1px solid hsl(240, 26%, 95%);
}
.close {
  background: url(@/assets/switch_close.png) no-repeat center;
  box-shadow: -6px -6px 10px #ffffff, 6px 6px 10px hsl(240, 30%, 86%);
}
.open {
  background: url(@/assets/switch_open.png) no-repeat center;
  box-shadow: -6px -6px 10px #ffffff, 6px 6px 10px hsl(240, 30%, 86%),
    inset -6px -6px 10px #ffffff, inset 6px 6px 10px hsl(240, 30%, 86%);
}
@media screen and (min-width: 800px) {
  #block {
    width: 360px;
    height: 140px;
  }

  #name {
    font-size: 32px;
  }
}
@media screen and (max-width: 638px), screen and (max-height: 598px) {
  #block {
    width: 220px;
    height: 100px;
  }
  #name {
    font-size: 20px;
  }
}
</style>
