const state = {
  dbTotal: [],
  tableTotal: []
}

const mutations = {
  ADD_ERROR_LOG: (state, log) => {
    state.logs.push(log)
  },
  CLEAR_ERROR_LOG: (state) => {
    state.logs.splice(0)
  }
}

const getters = {
  dbTotal(state) {
    return state.dbTotal.map(item => item.dbName)
  },
  table: state => dbName => {
    if(dbName){

    }else{
      return state.tableTotal.map(item => item.tableName)
    }
  },
  
}

const actions = {
  addErrorLog({ commit }, log) {
    commit('ADD_ERROR_LOG', log)
  },
  clearErrorLog({ commit }) {
    commit('CLEAR_ERROR_LOG')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
