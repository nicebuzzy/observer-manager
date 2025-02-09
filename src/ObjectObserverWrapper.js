export default class ObjectObserverWrapper {
  defaultOptions = {
    get: true,
    set: true,
    del: true
  }

  actions = {
    get: 'get',
    set: 'set',
    del: 'del'
  }

  constructor() {
    this.targets = new Map()
    this.proxies = new Map()
  }

  observe(target) {
    if (this.proxies.has(target)) {
      return this.proxies.get(target)
    }

    const proxy = this.createProxy(target)
    this.proxies.set(target, proxy)

    return proxy
  }

  createProxy(target) {
    return new Proxy(target, {
      get: (target, property, receiver) => {
        this.notify({
          type: this.actions.get,
          property,
          values: { curr: target[property] },
          target
        })

        return Reflect.get(target, property, receiver)
      },

      set: (target, property, value, receiver) => {
        this.notify({
          type: this.actions.set,
          property,
          values: { prev: target[property], next: value },
          target
        })

        return Reflect.set(target, property, value, receiver)
      },

      deleteProperty: (target, property) => {
        this.notify({
          type: this.actions.del,
          property,
          values: { curr: target[property] },
          target
        })

        return Reflect.deleteProperty(target, property)
      }
    })
  }

  subscribe(target, subscriber, options = this.defaultOptions) {
    if (!this.targets.has(target)) {
      this.targets.set(target, new Map())
    }

    this.targets.get(target).set(subscriber, options)
  }

  unsubscribe(target, subscriber) {
    if (!this.targets.has(target)) {
      return
    }

    const subscribers = this.targets.get(target)
    subscribers.delete(subscriber)

    if (subscribers.size === 0) {
      this.targets.delete(target)
      this.proxies.delete(target)
    }
  }

  disconnect() {
    return
  }

  clear() {
    this.targets.clear()
  }

  notify(mutation) {
    const { target } = mutation
    this.targets.get(target)?.forEach((options, subscriber) => {
      this.shouldNotify(mutation, options) && subscriber(mutation)
    })
  }

  shouldNotify(mutation, options) {
    return options[mutation.type] === true
  }
}