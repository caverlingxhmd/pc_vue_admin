<template>
  <div class="monaco-editor-sql-wrapper">
    <div id="monaco-editor-sql" ref="editor"></div>
  </div>
</template>

<script>
import Cookies from "js-cookie";

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
      monacoEditor: null, // 用来保存editor实例
      theme: Cookies.get("monaco-editor-theme") || "vs" // 编辑器主题：vs, hc-black, or vs-dark
    };
  },
  methods: {
    // monaco-editor 初始化
    initEditor() {
      this.monacoEditor = monaco.editor.create(
        document.getElementsById("conmonaco-editor-sql"),
        {
          value: this.sql, // 默认的sql语句
          theme: this.theme,
          language: "sql", // 采用哪种语言
          roundedSelection: false, // 右侧不显示编辑器预览框
          autoIndent: true, // 自动缩进
          fontSize: 14, // 字体大小
          readOnly: this.readOnly // 是否只读 不能编辑
        }
      );
      //监听变化
      this.monacoEditor.onDidChangeModelContent(() => {
        let value = this.monacoEditor.getValue()
        this.$emit('update:sql', value)
      });
      this.registerProvider();
    },
    // 注册输入字母之后的提示
    registerProvider() {}
  },
  mounted() {},
  beforeDestroy() {}
};
</script>

<style>
</style>