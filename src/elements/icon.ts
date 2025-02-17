import {dom, html} from '../utils'

export class SVGIcon extends HTMLElement {
  static get observedAttributes() {
    return ['use']
  }

  #use = ''

  set use(id) {
    this.#use = id
  }

  get use() {
    return this.#use
  }

  connectedCallback() {
    if (!this.use) {
      throw `Attribute use is missing`
    }

    const shadow = this.attachShadow({mode: 'open'})

    const icon = html`
      <svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <use href="${this.#use}" />
      </svg>
    `

    shadow.appendChild(dom(icon, 'text/html'))
  }

  attributeChangedCallback(name: string, _?: string, next?: string) {
    if (name === 'use' && next) this.#use = next
  }
}
customElements.define('svg-icon', SVGIcon)
