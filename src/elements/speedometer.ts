import {dom, html} from '../utils'

export class VehicleSpeedometer extends HTMLDivElement {
  constructor() {
    super()

    const speedometer = html`
      <div class="speedometer">
        <div class="bg"></div>
        <div class="lines">
          <span><span class="text">1</span></span>
          <span><span class="text">2</span></span>
          <span><span class="text">3</span></span>
          <span><span class="text">4</span></span>
          <span><span class="text">5</span></span>
          <span><span class="text">6</span></span>
          <span><span class="text">7</span></span>
          <span><span class="text">8</span></span>
          <span><span class="text">9</span></span>
        </div>
        <div class="rot" id="rpm">
          <div class="indicator"></div>
        </div>
        <div class="center">
          <div class="inner">
            <span class="small feat" id="gear">5</span>
            <span><span id="speed">150</span><sub>kph</sub></span>
            <span class="small" id="time">40.2</span>
          </div>
        </div>
      </div>
    `
    this.appendChild(dom(speedometer, 'text/html'))
  }
}
customElements.define('vehicle-speedometer', VehicleSpeedometer, {
  extends: 'div',
})
