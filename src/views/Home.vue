<script>
const ipcRenderer = window.ipcRenderer;
import block from "../components/block.vue";
export default {
  name: "HomeWord",
  data: () => {
    return {
      name: "",
      code: "",
      ip: "",
      url: "",
      electron: null,
    };
  },
  methods: {
    do() {
      if (this.$ws.ws.readyState == 1) this.$ws.ws.send("getEquipment");
      this.$store.commit("setCode", this.$ws.ws.code);
      this.code = this.$store.state.code;
      this.$ws.ws.onmessage = ({ data }) => {
        data = eval("(" + data + ")");
        if (Object.prototype.toString.call(data) == "[object Array]") {
          data.some((item) => {
            if (item.code == this.code) {
              data.unshift(data.splice(data.indexOf(item), 1)[0]);
            }
          });
          this.$store.state.equipment = data;
        } else {
          if (data.state) {
            this.$store.commit("changeOoc", data);
          } else {
            data = {
              code: data.from,
              information: {
                other: `${decodeURIComponent(window.atob(data.information))}`,
              },
            };
            this.$route.name == "chat" && this.$route.params.other == data.code
              ? this.$store.commit("addRecord", data)
              : this.$store.commit("addUnread", data);
          }
        }
      };
    },
    connection() {
      this.$store.state.ip = location.href.match(
        /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/
      )[0];
      this.$ws.ws = this.$ws.WebSocket(this.$store.state.ip, this.name);
      this.do();
    },
  },
  created() {
    if (
      window &&
      window.process &&
      window.process.versions &&
      window.process.versions["electron"]
    )
      this.electron = true;
    if (!this.$ws.ws) {
      if (this.electron) {
        this.$store.state.ip = ipcRenderer.sendSync("getIp");
        this.$ws.ws = this.$ws.WebSocket(this.$store.state.ip, "Main");
        this.do();
      } else {
        if (sessionStorage.getItem("charName")) {
          this.$ws.ws = this.$ws.WebSocket(
            this.$store.state.ip,
            this.charNameS
          );
          this.do();
        }
      }
    } else {
      this.$store.commit("setCode", this.$ws.ws.code);
      this.code = this.$store.state.code;
    }
  },
  components: {
    block,
  },
  computed: {
    charNameS() {
      let charName;
      this.$store.state.equipment.forEach((item) => {
        if (item.code == this.code) charName = item.name;
      });
      return charName;
    },
  },
};
</script>
  <template>
  <div id="homeWord">
    <div v-if="!this.$store.state.ip && !electron && !$ws.ws" id="name">
      <div>INPUT YOUR NAME</div>
      <input type="text" v-model="name" id="inputName" autocomplete="off"/>
      <input type="button" value="SUBMIT" id="submit" @click="connection" />
    </div>
    <div v-else>
      <div id="ip" v-if="$store.state.ip && electron">
        Access:
        <span style="color: #23c483">{{ $store.state.ip }}:3000</span>
      </div>
      <div>
        <transition-group name="block" tag="div" id="equipment">
          <div v-for="e in $store.state.equipment" :key="e.name">
            <block
              :name="e.name"
              :current="code == e.code"
              :equipment="e.equipment"
              :code="e.code"
            >
            </block>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>
  
  <style scoped>
#homeWord {
  overflow: scroll;
  border-radius: 18px;
  height: 100vh;
  -webkit-app-region: drag;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
#name {
  -webkit-app-region: no-drag;
  margin-top: 40vh;
  color: #23c483;
}
#name input {
  outline: none;
  border: none;
  padding: 20px;
}
#inputName {
  margin-top: 10px;
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
}
#submit {
  background: rgb(255, 255, 255);
  color: #23c483;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
}
#ip {
  position: absolute;
  top: 4px;
  left: 0;
  right: 0;
  color: rgb(120, 120, 120);
  z-index: 1;
}
#prompt {
  position: absolute;
  top: 50%;
}
#prompt input {
  outline: none;
  border: none;
  border-radius: 20px;
  padding: 10px 12px;
}
#prompt input[type="button"]:hover {
  transition: all 0.4s linear;
  color: #23c483;
}
#equipment {
  padding: 32px 0;
  display: grid;
  grid-column-gap: 40px;
  grid-row-gap: 24px;
  grid-template-columns: 1fr 1fr;
  grid-auto-flow: row dense;
}
.block-enter-from,
.block-leave-to {
  opacity: 0;
}
.block-move,
.block-enter-active,
.block-leave-active {
  transition: all 0.4s ease;
}
.block-leave-active {
  position: absolute;
}
</style>
  