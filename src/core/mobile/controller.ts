
// const button = {
//   up: create('button', {type: 'button', className: 'axes-up'}),
//   right: create('button', {type: 'button', className: 'axes-right'}),
//   down: create('button', {type: 'button', className: 'axes-down'}),
//   left: create('button', {type: 'button', className: 'axes-left'}),
//   a: create('button', {type: 'button', className: 'button-a'}),
//   b: create('button', {type: 'button', className: 'button-b'}),
//   y: create('button', {type: 'button', className: 'button-y'}),
// }

export class MobileController extends HTMLElement {
  shadow: ShadowRoot

  constructor() {
    super()
    const template = mobileInput.content.cloneNode(true)
    this.shadow = this.attachShadow({mode: 'open'})
    this.shadow.appendChild(template)
    this.classList.add('mobile-controller')
  }

  connectedCallback() {
    const axesUp = this.#query('.axes-up')
    const axesDown = this.#query('.axes-down')
    const axesLeft = this.#query('.axes-left')
    const axesRight = this.#query('.axes-right')
    console.log(axesUp, axesDown, axesLeft, axesRight)

    const buttonY = this.#query('.button-y')
    const buttonX = this.#query('.button-x')
    const buttonB = this.#query('.button-b')
    const buttonA = this.#query('.button-a')

    console.log(buttonY, buttonX, buttonB, buttonA)
  }

  #query(selector: string) {
    const el = this.shadow.querySelector(selector)
    if (!el) `Selector ${selector} does not found`
    return el
  }
}
customElements.define('mobile-controller', MobileController)
