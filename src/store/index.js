import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    code: "",
    equipment: [],
    records: {},
    unread: {},
    ip: "",
    ooc: {},
  },
  getters: {},
  mutations: {
    setCode(state, code) {
      state.code = code;
    },
    addRecord(state, record) {
      if (state.records[record.code] == undefined) {
        Vue.set(state.records, `${record.code}`, []);
        state.records[record.code].push(record.information);
      } else {
        state.records[record.code].push(record.information);
      }
    },
    addUnread(state, unread) {
      if (state.unread[unread.code] == undefined) {
        Vue.set(state.unread, `${unread.code}`, []);
        state.unread[unread.code].push(unread.information);
      } else {
        state.unread[unread.code].push(unread.information);
      }
    },
    clearUnread(state, code) {
      if (state.records[code] == undefined) {
        Vue.set(state.records, `${code}`, []);
      }
      if (state.unread[code] != undefined && state.records[code] != undefined) {
        state.records[code] = state?.records[code].concat(state.unread[code]);
      }
      Vue.set(state.unread, `${code}`, []);
    },
    changeOoc(state, data) {
      if (state.ooc[data.from] == undefined) {
        Vue.set(state.ooc, `${data.from}`, []);
      }
      state.ooc[data.from] = data.state == "open" ? true : false;
    },
    inversion(state, code) {
      state.ooc[this.code] = !state.ooc[code] ? true : false;
    },
  },
  actions: {},
  modules: {},
});
