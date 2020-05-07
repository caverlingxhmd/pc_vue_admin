<template>
  <div class="monaco-editor-wrapper">
    <monaco-editor :sql.sync="sql"></monaco-editor>
  </div>
</template>

<script>
import MonacoEditor from "@/components/MonacoEditor/sql";
export default {
  components: {
    "monaco-editor": MonacoEditor
  },
  data() {
    return {
      sql: ""
    };
  }
};
</script>

<style>
</style>