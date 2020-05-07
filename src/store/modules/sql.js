const state = {
  dbTotal: [],
  tableTotal: []
}

const mutations = {
  SET_DATA: (state, data) => {
    state[data.key] = data.value
  }
}

const getters = {
  dbTotal(state) {
    return state.dbTotal.map(item => item.dbName)
  },
  table: state => dbName => {
    if (dbName) {

    } else {
      return state.tableTotal.map(item => item.tableName)
    }
  },
  table: state => (dbName, tableName) => {
    if (dbName && tableName) {

    } else {
      return state.tableTotal.map(item => item.tableName)
    }
  },
}

const actions = {
  getDb({ commit }) {

  },
  // 获取数据库下的数据表
  getTable({ commit }, log) {
    commit('ADD_ERROR_LOG', log)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
