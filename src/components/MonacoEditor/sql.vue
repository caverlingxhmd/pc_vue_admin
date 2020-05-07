<template>
  <div class="monaco-editor-sql-wrapper">
    <div class="monaco-editor-sql-box" ref="editor"></div>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/editor/editor.all.js";
import "monaco-editor/esm/vs/basic-languages/mysql/mysql.contribution";
import "monaco-editor/esm/vs/basic-languages/shell/shell.contribution";
import "monaco-editor/esm/vs/editor/contrib/suggest/suggest.js";
import "monaco-editor/esm/vs/editor/contrib/bracketMatching/bracketMatching.js";
import "monaco-editor/esm/vs/editor/contrib/comment/comment.js";
import "monaco-editor/esm/vs/editor/contrib/folding/folding.js";
import "monaco-editor/esm/vs/editor/contrib/contextmenu/contextmenu.js";
import uniqBy from "lodash/uniqBy"
import {mapState} from "vuex"
const sortText = {
  Database: "0",
  Table: "1",
  Column: "2",
  Variable: "3",
  Keyword: "4",
  Attribute: "5"
};

export default {
  props: {
    // 初始化的sql语句 加上sync
    sql: {
      type: String,
      default: ""
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState({
      // dbTotal: state => state.sql.dbTotal,

    }),
    dbTotal(){
      return this.$store.getters['sql/dbTotal']
    }
  },
  data() {
    return {
      work: null,
      editor: null, // 用来保存editor实例
      suggest: null, // 推荐的对象
      theme: Cookies.get("monaco-editor-theme") || "vs" // 编辑器主题：vs, hc-black, or vs-dark
    };
  },
  methods: {
    initWoker() {
      this.work = {
        renderDatabase(dbname) {
          return {
            label: dbname, // 显示的提示内容
            kind: monaco.languages.CompletionItemKind.Module, // 显示图标不同
            detail: "Databse", // 提示内容后的说明
            sortText: sortText.Database,
            insertText: dbname // 选择后粘贴到编辑器的文字
          };
        },
        renderKeyword(keyword) {
          return {
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            detail: "Keyword",
            sortText: sortText.Keyword,
            inserText: keyword
          };
        },
        renderTable(tablename, dbname) {
          return {
            label: tablename,
            kind: monaco.languages.CompletionItemKind.Class,
            detail: dbname || "Table",
            sortText: sortText.Table,
            insertText: tablename
          };
        },
        renderAttribute(attribute, tablename) {
          return {
            label: attribute,
            kind: monaco.languages.CompletionItemKind.Variable,
            detail: tablename || "Attribute",
            sortText: sortText.Attribute,
            insertText: attribute
          };
        },
        renderVariable(variable) {
          return {
            label: variable,
            kind: monaco.languages.CompletionItemKind.Variable,
            detail: "Variable",
            sortText: sortText.Variable,
            insertText: variable
          };
        },
        renderFunc(fun) {
          return {
            label: fun,
            kind: monaco.languages.CompletionItemKind.Variable,
            detail: "函数",
            sortText: sortText.Variable,
            inserText: fun
          };
        },
        judeSuggestionType(model, position, context) {
          let lineCount = model.getLineCount();
          let lastColumn = model.getLineMaxColumn(lineCount);
          const { lineNumber, column } = position;
          const textBeforePointer = model.getValueInRange({
            startLineNumber: 0,
            startColumn: 0,
            endLineNumber: 0,
            endColumn: column
          });
          const textAfterPointer = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: lineCount,
            endColumn: lastColumn
          });
          const tokens = textBeforePointer.trim().split(/\s+/);
          let arr = tokens[tokens.length - 1].split(".").filter(item => !!item);
          const lastToken = arr[0];
          const afterToken = arr[1];
          let len = arr.length;
          if (
            typeof context.triggerCharacter === "string" &&
            context.triggerCharacter === "{"
          ) {
            return {
              triggerType: "variable",
              triggerValue: null
            };
          }
          if (
            typeof context.triggerCharacter === "string" &&
            context.triggerCharacter === "."
          ) {
            if (len === 1) {
              return {
                triggerType: "database",
                triggerValue: lastToken
              };
            } else {
              return {
                triggerType: "table",
                triggerValue: {
                  lastToken, // dbname
                  afterToken // tablename
                }
              };
            }
          }
          return {
            triggerType: null,
            triggerValue: ""
          };
        }
      };
    },
    // monaco-editor 初始化
    initEditor() {
      monaco.editor.defineTheme("myTheme", {
        base: "vs",
        inherit: true,
        rules: [{ background: "EDF9FA" }],
        colors: {
          //"editor.selectionBackground": "#ffff00",
          // "editor.selectionHighlightBackground":"#fff793",
          "editor.findMatchBackground": "#ffff00",
          "editor.findMatchHighlightBackground": "#fff793"
        }
      });
      this.editor = monaco.editor.create(this.$refs.editor, {
        value: this.sql, // 默认的sql语句
        theme: this.theme === "vs" ? "myTheme" : this.theme,
        language: "mysql", // 采用哪种语言
        autoIndent: true, // 自动缩进
        fontSize: "14px", // 字体大小
        readOnly: this.readOnly, // 是否只读 不能编辑
        wordWrap: "on", // 自动换行
        minimal: {
          // enabled: true // 右侧小代码区域不显示
        },
        suggestOnTriggerChracters: true,
        showFoldingControls: "always", // 显示折叠按钮
        automaticLayout: true // 自动布局 屏幕变化时
      });
      //监听变化
      this.editor.getModel().onDidChangeContent(() => {
        this.$emit("update:sql", this.getValue());
      });
    },
    // 获取内容
    getValue() {
      return this.editor.getValue({ lineEnding: "\n" });
    },
    // 写入内容
    setValue() {
      const model = this.editor.getModel();
      model.pushEditorOperations(
        [],
        [
          {
            range: model.getFullModelRange(),
            text: value
          }
        ]
      );
    },
    setTheme(type = "vs") {
      monaco.editor.setTheme(type === "vs" ? "myTheme" : type);
    },
    // 销毁编辑器
    disposeEditor() {
      if (this.editor) {
        this.editor.getModel().dispose();
        this.editor.dispose();
        this.editor = null;
        if (this.suggest) {
          this.suggest.dispose();
          this.suggest = null;
        }
      }
    },
    // sql格式化
    formatSql() {
      this.editor.setValue();
    },
    // 注册输入字母之后的提示
    registerProvider() {
      let _this = this;
      this.suggest = monaco.languages.registerCompletionItemProvider("mysql", {
        triggerCharacters: ".{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(
          ""
        ),
        provideCompletionItems: function(model, position, context, token) {
          let { triggerType, tiggerValue } = _this.work.judeSuggestionType(
            model,
            position,
            context
          );
          switch (triggerType) {
            case "database":
              return new Promise((resolve, reject) => {
                if (triggerValue) {
                  _this.$store
                    .dispatch("sql/getTable", { dbname: triggerValue })
                    .then(res => {
                      let suggestions = res.map(item => {
                        return _this.work.renderTable(item, triggerValue);
                      });
                    });
                } else {
                  resolve({
                    suggestions: []
                  });
                }
              });
              break;
            case "table":
              return new Promise((resolve, reject) => {
                if (triggerValue) {
                  _this.$store
                    .dispatch("sql/getTable", {
                      dbname: "triggerValue.lastToken"
                    })
                    .then(res => {
                      let suggestions = res.map(item => {
                        return _this.work.renderTable(item, triggerValue);
                      });
                    });
                } else {
                  resolve({
                    suggestions: []
                  });
                }
              });
              break;
            case "variable":
              return {
                suggestions: _this.variable.map(_this.work.renderVariable)
              };
              break;
            default:
              let dbTotal = _this.dbTotal.map(_this.work.renderDatabase);
              // let funList = _this.funList.map(_this.work.renderFunc);
              let table = _this.table.map(_this.work.renderTable);
              let column = _this.column.map(item => {
                return _this.work.renderTable(item, "属性");
              });
              // let sqlHint = mysqlHint.map(_this.work.renderKeyword); // sql原生的函数
              let data = [
                ...dbTotal,
                ...table,
                ...column,
                // ...funList
                // ...sqlHint
              ];
          }
          return {
            suggestions: uniqBy(data, "insertText")
          };
        },
        resolveCompletionItem(model, position, item, token) {
          return {};
        }
      });
    }
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.initWoker();
        this.initEditor();
        this.registerProvider();
      }, 20);
    });
  },
  beforeDestroy() {
    this.disposeEditor();
  }
};
</script>

<style lang="scss">
.monaco-editor-sql-wrapper {
  .monaco-editor-sql-box {
    height: 800px;
  }
}
</style>