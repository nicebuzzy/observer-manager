export default class MutationObserverWrapper {
  defaultOptions = {
    attributes: true,
    childList: true
  }

  constructor() {
    this.observer = new MutationObserver(mutations => this.notify(mutations))
    this.subscribers = new Map()
  }

  subscribe(target, subscriber, options = this.defaultOptions) {
    if (!this.subscribers.has(target)) {
      this.subscribers.set(target, new Map())
    }

    this.subscribers.get(target).set(subscriber, options)
    this.observer.observe(target, Object.assign({}, ...this.subscribers.get(target).values()))
  }

  unsubscribe(target, subscriber) {
    if (!this.subscribers.has(target)) {
      return
    }

    const subscribers = this.subscribers.get(target)
    subscribers.delete(subscriber)

    if (subscribers.size === 0) {
      this.subscribers.delete(target)

      this.notify(this.observer.takeRecords())
      this.disconnect()
      this.reconnect()
    }
  }

  disconnect() {
    this.observer?.disconnect()
  }

  clear() {
    this.subscribers.clear()
  }

  reconnect() {
    this.subscribers.forEach((subscribers, target) => {
      subscribers.forEach((options, subscriber) => {
        this.subscribe(target, subscriber, options)
      })
    })
  }

  notify(mutations) {
    mutations.forEach(mutation => {
      const { target } = mutation
      this.subscribers.get(target)?.forEach((options, subscriber) => {
        this.shouldNotify(mutation, options) && subscriber(mutation)
      })
    })
  }

  shouldNotify(mutation, options) {
    return options[mutation.type] === true
  }
}