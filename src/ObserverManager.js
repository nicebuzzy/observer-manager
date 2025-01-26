import MutationObserverWrapper from './MutationObserverWrapper'
import ObjectObserverWrapper from './ObjectObserverWrapper'

export default class ObserverManager {
  types = {
    mutation: MutationObserverWrapper,
    object: ObjectObserverWrapper
  }

  constructor() {
    this.observers = new Map()
    Object.keys(this.types).forEach(type => this[type] = () => this.get(type))
  }

  get(type) {
    if (!this.types[type]) {
      throw new Error(`Type ${type} is not supported.`)
    }

    if (this.observers.has(type)) {
      return this.observers.get(type)
    }

    const observer = new this.types[type]()
    this.observers.set(type, observer)

    return observer
  }

  disconnect(type) {
    if (this.observers.has(type)) {
      this.get(type).disconnect()
    }
  }

  clear() {
    this.observers.keys().forEach(type => {
      this.get(type).clear()
      this.observers.delete(type)
    })
  }

  list() {
    return Object.fromEntries(this.observers.entries())
  }
}