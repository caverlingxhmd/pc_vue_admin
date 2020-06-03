import cloneDeep from "lodash/cloneDeep"

export default function waterMark({
  container = document.body,
  width = 300,
  height = 200,
  textAlign = "center",
  textBaseline = "middle",
  font = "20px Microsoft Yahei",
  fillStyle = "rgba(184,184,184,0.2)",
  content = "请勿外传",
  rotate = 30,
  zIndex = 1000
} = {}, isReload) {
  if (!isReload) {
    if (waterMark.installed) return
    waterMark.intalled = true
  }
  const args = cloneDeep(arguments[0])
  const canvas = document.createElement("canvas")
  canvas.setAttribute("width", width)
  canvas.setAttribute("height", height)
  const cxt = canvas.getContext("2d")
  cxt.textAlign = textAlign
  cxt.textBaseline = textBaseline
  cxt.font = font
  cxt.rotate((Math.PI / 180) * rotate)
  cxt.fillStyle = fillStyle
  cxt.fillText(content, parseFloat(width / 4), parseFloat(height / 4))
  const base64Url = canvas.toDataURL()
  const wm = document.querySelector(".__wm")
  const waterMarkDiv = wm || document.createElement("div")
  let styleStr = `
     position: absolute;
     top:0;
     left:0;
     right:0;
     bottom:0;
     z-index: ${zIndex};
     pointer-events:none;
     background-repeat:repeat;
     background-image: url("${base64Url}")`
  waterMarkDiv.setAttribute("style", styleStr)
  if (!wm) {
    waterMarkDiv.classList.add("__wm")
    container.insertBefore(waterMarkDiv, container.firstChild)
  }
  // 节点监听不能 删除水印 以及 移动水印 修改水印样式
  const MutationObserver = window.MutationObserver || window.WebkitMutationObserver
  if (MutationObserver) {
    let mo = new MutationObserver(function () {
      let wm = document.querySelector(".__wm")
      if (!wm || wm.getAttribute("style") !== styleStr || wm.parentNode !== container) {
        mo.disconnect()
        mo = null
        waterMark(args, true)
      }
    })
    mo.observe(container, {
      childList: true
    })
    mo.observe(waterMarkDiv, {
      childList: true,
      subtree: true,
      attributes: true
    })
  }
}