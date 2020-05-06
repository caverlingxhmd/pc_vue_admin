<template>
  <div class="monaco-editor-sql-wrapper">
    <div id="monaco-editor-sql" ref="editor"></div>
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
  data() {
    return {
      editor: null, // 用来保存editor实例
      suggest: null, // 推荐的对象
      theme: Cookies.get("monaco-editor-theme") || "vs" // 编辑器主题：vs, hc-black, or vs-dark
    };
  },
  methods: {
    // monaco-editor 初始化
    initEditor() {
      monaco.editor.defineTheme({
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
        roundedSelection: false, // 右侧不显示编辑器预览框
        autoIndent: true, // 自动缩进
        fontSize: 14, // 字体大小
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
      this.suggest = monaco.languages.registerCompletionItemProvider("mysql", {
        triggerCharacters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
        provideCompletionItems: function(model, position) {
          // get editor content before the pointer
          var textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          });
          var match = textUntilPosition.match(/(\S+)$/);
          if (!match) return [];
          match = match[0].toUpperCase();
          return {
            suggestions
          };
        }
      });
    }
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.initEditor();
        this.registerProvider()
      }, 20);
    });
  },
  beforeDestroy() {
    this.disposeEditor();
  }
};
</script>

<style>
</style>