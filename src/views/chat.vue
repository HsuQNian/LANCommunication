<script>
export default {
  name: "chAt",
  computed: {
    charNameS() {
      return this.$store.state.equipment;
    },
    records() {
      return this.$store.state.records[this.other];
    },
    unreadMsg() {
      let num = 0;
      for (let i in this.$store.state.unread) {
        num += this.$store.state.unread[i].length;
      }
      return num;
    },
    state() {
      return this.$store.state.equipment.some((item) => {
        if (item.name == this.charName) return true;
      });
    },
    innerHeight() {
      return window.innerHeight;
    },
  },
  watch: {
    records() {
      this.scroll();
    },
    unreadMsg() {
      if (this.unreadMsg > 0) {
        this.vibration = true;
        setTimeout(() => {
          this.vibration = false;
        }, 200);
      }
    },
  },
  data: () => {
    return {
      equipment: [],
      timeConnect: 0,
      charName: "",
      textdata: "",
      other: "",
      vibration: "",
    };
  },
  mounted() {
    this.charName = this.$route.params.name;
    this.other = this.$route.params.other;
    this.scroll();
    if (this.$store.state.code == "" || !this.charName) {
      this.$router.push("/");
    }
  },
  methods: {
    scroll() {
      setTimeout(() => {
        this.$refs.content.$el.scrollTop = this.$refs.content.$el.scrollHeight;
      }, 100);
    },
    back() {
      this.$router.push("/");
    },
    send() {
      if (event.keyCode == 13) {
        if (this.textdata != "") {
          setTimeout(() => {
            this.$ws.ws.send(
              JSON.stringify({
                message: {
                  from: this.$store.state.code,
                  information: window.btoa(encodeURIComponent(this.textdata)),
                  to: this.other,
                },
              })
            );
            this.$store.commit("addRecord", {
              code: this.other,
              information: { me: this.textdata },
            });
            this.textdata = "";
          }, 1);
        } else {
          setTimeout(() => {
            this.textdata = "";
          }, 0.1);
        }
      }
    },
    focus() {
      document.onresize = () => {
        this.$store.commit("addRecord", {
          code: this.other,
          information: { me: "改变了" },
        });
      };
    },
  },
};
</script> 
<template>
  <div id="chat">
    <div id="head">
      <svg
        t="1657475574348"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="1714"
        id="mx_n_1657475574348"
        data-spm-anchor-id="a313x.7781069.0.i1"
        width="30"
        height="30"
        @click="back"
      >
        <path
          d="M346.52382345477406 104.43830532674417c-12.257495055447652-12.257495055447652-30.6437359627898-12.257495055447652-42.90123101823747 0s-12.257495055447652 30.6437359627898 0 42.90123101823747L668.2830560915551 512 303.6225924365366 876.6604636550185c-12.257495055447652 12.257495055447652-12.257495055447652 30.6437359627898 0 42.90123101823747 6.128747527723826 6.128747527723826 15.3218679813949 9.193120453671073 21.450615509118734 9.193120453671073s15.3218679813949-3.064372925947246 21.450615509118734-9.193120453671073l386.1110791641372-386.1110791641372c12.257495055447652-12.257495055447652 12.257495055447652-30.6437359627898 0-42.90123101823747L346.52382345477406 104.43830532674417z"
          fill="#8a8a8a"
          p-id="1715"
          data-spm-anchor-id="a313x.7781069.0.i2"
          class=""
        ></path>
      </svg>
      <div
        id="unreadMsg"
        v-show="unreadMsg"
        ref="unreadMsg"
        :class="{ unreadMsg: vibration }"
      >
        {{ unreadMsg || "" }}
      </div>
      <div style="font-size: 1.4rem; display: flex; justify-content: center">
        {{ charName }}
        <span style="font-size: 0.8rem; position: absolute; top: 42px">
          {{ state ? "在线状态" : "离线状态" }}
        </span>
      </div>
    </div>
    <transition-group id="content" ref="content" tag="div" name="content">
      <div
        v-for="(record,index) in $store.state.records[this.other]"
        :key="index"
        style="padding: 4px 32px; font-size: 1.4rem"
      >
        <div class="other" v-if="!!record?.other">
          <div>{{ record.other }}</div>
        </div>
        <div class="me" v-if="!!record?.me">
          <div>{{ record.me }}</div>
        </div>
      </div>
    </transition-group>
    <div id="input">
      <textarea
        @focus="focus"
        ref="textarea"
        cols="30"
        rows="10"
        v-model="textdata"
        @keypress="send"
      ></textarea>
    </div>
  </div>
</template>
<style scoped>
#chat {
  min-height: 100vh;
  align-items: center;
  flex-direction: column;
  display: flex;
  position: relative;
  overflow: hidden;
}
#chat svg {
  -webkit-app-region: no-drag;
  top: auto;
  left: 10px;
  transform: rotate(180deg);
  position: absolute;
}
#unreadMsg {
  color: #a2ddb8;
  position: absolute;
  left: 40px;
  top: auto;
  font-size: 1.2rem;
  border-radius: 50%;
  line-height: 20px;
}
.block {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}
#head {
  -webkit-app-region: drag;
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  box-shadow: 0px 4px 4px -4px hsl(240, 30%, 86%);
  z-index: 1;
}

#content {
  position: absolute;
  margin-top: 70px;
  overflow: scroll;
  width: 100%;
  max-height: calc(100vh - 70px - 136px);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  border-radius: 12px;
  user-select: text;
  color: #2c3e50;
  transition: all 0.3s ease-in-out;
  scroll-behavior: smooth;
}
.other,
.me {
  display: flex;
  align-items: center;
  position: relative;
  text-align: start;
}
.other div,
.me div {
  word-break: break-all;
  white-space: pre-wrap;
  padding: 8px 12px;
  border-radius: 12px;
  background: hsl(240, 26%, 95%);
  font-size: 1.2rem;
  min-width: 12px;
  box-shadow: -2px -2px 8px #ffffff, 2px 2px 8px hsl(240, 30%, 86%);
}
.me::before {
  right: -24px;
  background-image: linear-gradient(
    -225deg,
    #2cd8d5 0%,
    #c5c1ff 56%,
    #ffbac3 100%
  );
}
.other::before,
.me::before {
  margin: -2px;
  content: "";
  position: absolute;
  top: auto;
  width: 20px;
  height: 20px;
  border-radius: 50%;
}
.other::before {
  left: -24px;
  background-image: linear-gradient(
    -225deg,
    #ff057c 0%,
    #7c64d5 48%,
    #4cc3ff 100%
  );
}
.me {
  flex-direction: row-reverse;
}
#input {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 72px;
}
textarea {
  box-shadow: 0px -4px 4px -4px hsl(240, 30%, 86%);
  width: 90vw;
  height: 84px;
  border: none;
  border-radius: 12px;
  background: hsl(240, 26%, 95%);
  font-size: 1.2rem;
  outline: none;
  padding: 20px;
  resize: none;
  position: absolute;
  z-index: 1;
}
.unreadMsg {
  animation: vibration 0.2s;
}
@keyframes vibration {
  0%,
  100% {
    transform: translateX(0px);
  }
  25% {
    transform: translateX(-8px);
  }
  75% {
    transform: translateX(8px);
  }
}
.content-enter,
.content-leave-to {
  opacity: 0;
}
.content-enter-active,
.content-leave-active {
  transition: all 0.4s ease;
}
.content-leave-active {
  position: absolute;
}
.content-move {
  transition: all 0.4s ease;
}
@media screen and (min-width: 642px), screen and (min-height: 602px) {
  #input {
    bottom: 128px;
  }
  #content {
    max-height: calc(100vh - 70px - 240px);
    font-size: 2.2rem;
  }
  textarea {
    height: 180px;
    width: 96vw;
    font-size: 2.2rem;
  }
  .other div,
  .me div {
    font-size: 1.8rem;
    padding: 8px 16px;
  }
}
@media screen and (max-width: 638px), screen and (max-height: 598px) {
  .other div,
  .me div {
    font-size: 1.4rem;
  }
  textarea {
    font-size: 1.4rem;
  }
}
</style>