export default class MutationObserverWrapper {
  defaultOptions = {
    attributes: true,
    childList: true,
    subtree: false
  }

  constructor() {
    this.observer = new MutationObserver(mutations => this.notify(mutations))
    this.targets = new Map()
  }

  subscribe(target, subscriber, options = this.defaultOptions) {
    if (!this.targets.has(target)) {
      this.targets.set(target, new Map())
    }

    this.targets.get(target).set(subscriber, options)
    this.observer.observe(target, this.getCombinedTargetOptions(target))
  }

  getCombinedTargetOptions(target) {
    const objects = [this.defaultOptions, ...this.targets.get(target).values()]

    return objects.reduce((acc, options) => {
      Object.keys(options).forEach(key => acc[key] = acc[key] || options[key])
      return acc
    }, {})
  }

  unsubscribe(target, subscriber) {
    if (!this.targets.has(target)) {
      return
    }

    const subscribers = this.targets.get(target)
    subscribers.delete(subscriber)

    if (subscribers.size === 0) {
      this.targets.delete(target)

      this.notify(this.observer.takeRecords())
      this.disconnect()
      this.reconnect()
    }
  }

  disconnect() {
    this.observer?.disconnect()
  }

  reconnect() {
    this.targets.forEach((subscribers, target) => {
      subscribers.forEach((options, subscriber) => {
        this.subscribe(target, subscriber, options)
      })
    })
  }

  clear() {
    this.targets.clear()
  }

  notify(mutations) {
    mutations.forEach(mutation => {
      this.targets.forEach((subscribers, target) => {
        const isMutationRelevant = this.isMutationRelevant(mutation, target)

        if (!isMutationRelevant) {
          return
        }

        subscribers.forEach((options, subscriber) => {
          const shouldNotify = this.shouldNotify(mutation, target, options)
          shouldNotify && subscriber(mutation)
        })
      })
    })
  }

  shouldNotify(mutation, target, options) {
    const isTypeMatch = this.isTypeMatch(mutation, options)
    const isTargetEqual = this.isTargetEqual(mutation, target)
    const isSubtree = this.isSubtree(mutation, target)

    return isTypeMatch && (isTargetEqual || isSubtree && options.subtree)
  }

  isMutationRelevant(mutation, target) {
    return this.isTargetEqual(mutation, target) || this.isSubtree(mutation, target)
  }

  isTargetEqual(mutation, target) {
    return target === mutation.target
  }

  isSubtree(mutation, target) {
    return target.contains(mutation.target)
  }

  isTypeMatch(mutation, options) {
    return options[mutation.type] === true
  }
}