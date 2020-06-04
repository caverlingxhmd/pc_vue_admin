import { Scene, Ring, Arc } from 'spritejs'
export default class circleDraggable {
  constructor(options) {
    this.options = Object.assign({}, {
      basicCircleFillColor: '#c0c0c0',
      basicCircleStartAngle: 0,
      basicCircleEndAngle: 360,
      outerCircleFillColor: '#f15a4a',
      outerCircleStartAngle: 0,
      dragCircleRadius: 25,
      dragCircleFillColor: '#f15a4a',
      lineWidth: 30,
      dragCircleAngle: 60,
      dragSmallArcFillColor: '#fff'
    }, options)
    this.init()
  }
  init() {
    this.container = document.querySelector(this.options.container)
    this.width = this.container.clientWidth
    this.height = this.container.clientHeight
    this.basicCircleInnerRadius = this.width / 2 - 20 - this.options.lineWidth
    this.basicCircleOuterRadius = this.width / 2 - 20
    this.outerCircleInnerRadius = this.width / 2 - 20 - this.options.lineWidth
    this.outerCircleOuterRadius = this.width / 2 - 20
    const scene = new Scene({
      container: this.container,
      width: this.width,
      height: this.height
    })
    this.layer = scene.layer()
    this.basicRing = new Ring({
      anchor: [0.5, 0.5],
      pos: [this.width / 2, this.height / 2],
      innerRadius: this.basicCircleInnerRadius,
      outerRadius: this.basicCircleOuterRadius,
      fillColor: this.options.basicCircleFillColor,
      startAngle: this.options.basicCircleStartAngle,
      endAngle: this.options.basicCircleEndAngle
    })
    this.layer.append(this.basicRing)
    this.outerRing = this.basicRing.cloneNode()
    this.dragArc = new Arc()
    this.dragSmallArc = this.dragArc.cloneNode()
    this.draw()
    this.event()
  }
  draw() {
    this.outerRing.attr({
      innerRadius: this.outerCircleInnerRadius,
      outerRadius: this.outerCircleOuterRadius,
      startAngle: 0,
      endAngle: this.options.dragCircleAngle,
      fillColor: this.options.outerCircleFillColor
    })
    this.layer.append(this.outerRing)
    const pos = this.getDragXYcoordinate()
    this.dragArc.attr({
      pos,
      radius: this.options.dragCircleRadius,
      fillColor: this.options.dragCircleFillColor
    })
    this.layer.append(this.dragArc)
    this.dragSmallArc.attr({
      pos,
      radius: this.options.lineWidth / 2,
      fillColor: this.options.dragSmallArcFillColor
    })
    this.layer.append(this.dragSmallArc)
  }
  event() {
    let isMouseDownInnerOut = false
    const _this = this
    const outerInnerRing = function(evt) {
      dragArcScale()
      if (isMouseDownInnerOut) {
        isMouseDownInnerOut = false
        const { x, y } = evt
        const [x1, y1] = this.getOffsetPosition(x, y).map(Math.round)
        _this.getDragXYAngle(x1, -y1)
        _this.draw()
      }
      this.layer.removeEventListener('mousemove', layerMove)
      this.layer.removeEventListener('mouseleave', layerOut)
    }
    const layerMove = function(evt) {
      const { x, y } = evt
      let [x1, y1] = this.layer.getOffsetPosition(x, y).map(Math.round)
      x1 = x1 - _this.width / 2
      y1 = -y1 + _this.height / 2
      _this.getDragXYAngle(x1, y1)
      _this.draw()
    }
    const layerOut = function() {
      isMouseDownInnerOut = false
      dragArcScale()
      this.layer.removeEventListener('mousemove', layerMove)
      this.layer.removeEventListener('mouseleave', layerOut)
    }
    const dragArcScale = (scale = [1, 1]) => {
      this.dragArc.attr({
        scale
      })
      this.dragSmallArc.attr({
        scale
      })
      this.layer.append(this.dragArc)
      this.layer.append(this.dragSmallArc)
    }
    this.layer.addEventListener('mouseup', outerInnerRing)
    this.outerRing.addEventListener('mousedown', function() {
      isMouseDownInnerOut = true
    })
    this.basicRing.addEventListener('mousedown', function() {
      isMouseDownInnerOut = true
    })
    this.dragArc.addEventListener('mousedown', () => {
      dragArcScale([1.1, 1.1])
      this.layer.addEventListener('mousemove', layerMove)
      this.layer.addEventListener('mouseleave', layerOut)
    })
    this.dragSmallArc.addEventListener('mousedown', () => {
      dragArcScale([1.1, 1.1])
      this.layer.addEventListener('mousemove', layerMove)
      this.layer.addEventListener('mouseleave', layerOut)
    })
  }
  // 根据 2点 坐标原点 求夹角
  getDragXYAngle(x1, y1) {
    const [cx, cy, x2, y2] = [0, 0, 200, 0]
    let c1 = Math.atan2(y1 - cy, x1 - cx) * 180 / Math.PI
    let c2 = Math.atan2(y2 - cy, x2 - cx) * 180 / Math.PI
    let angle
    c1 = c1 <= -90 ? 360 + c1 : c1
    c2 = c2 <= -90 ? 360 + c2 : c2
    angle = Math.floor(c2 - c1)
    angle = angle < 0 ? angle + 360 : angle
    this.options.dragCircleAngle = angle
  }
  // 根据 坐标原点 角度 求圆弧上的点
  getDragXYcoordinate() {
    const r = this.basicCircleOuterRadius - this.options.lineWidth / 2
    let x = r * Math.cos(this.options.dragCircleAngle * Math.PI / 180)
    let y = r * Math.sin(this.options.dragCircleAngle * Math.PI / 180)
    this.dragCirclePos = [x, y]
    x = this.width / 2 + x
    y = this.height / 2 + y
    return [x, y]
  }
}
