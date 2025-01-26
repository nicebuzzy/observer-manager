import { describe, expect, test, vi } from "vitest"
import { ObserverManager } from "./src"

describe('ObserverManager', () => {
  const manager = new ObserverManager()

  test('create one instance per type', () => {
    manager.mutation()
    manager.object()
    manager.object()
    expect(manager.observers.size).toBe(2)
  })

  test('clear', () => {
    manager.clear()
    expect(manager.observers.size).toBe(0)
  })
})

describe('MutationObserver', () => {
  const manager = new ObserverManager()
  const observer = manager.mutation()

  const any = vi.fn((mutation) => expect(mutation.type).toBeOneOf(['childList', 'attributes']))
  const child = vi.fn((mutation) => expect(mutation.type).toBe('childList'))
  const attributes = vi.fn((mutation) => expect(mutation.type).toBe('attributes'))

  const target = document.body

  test('subscribe', () => {
    observer.subscribe(target, any)
    observer.subscribe(target, child, { childList: true })
    observer.subscribe(target, attributes, { attributes: true })

    expect(observer.subscribers.has(target)).toBe(true)
    expect(observer.subscribers.size).toBe(1)
    expect(observer.subscribers.get(target).size).toBe(3)
  })

  test('notify', async () => {
    target.appendChild(document.createElement('foo'))
    target.setAttribute('foo', 'bar')

    await vi.waitFor(() => {
      expect(any).toHaveBeenCalledTimes(2)
      expect(child).toHaveBeenCalledTimes(1)
      expect(attributes).toHaveBeenCalledTimes(1)
    })
  })

  test('unsubscribe', async () => {
    observer.unsubscribe(target, any)

    expect(observer.subscribers.get(target).get(any)).toBeUndefined()
    expect(observer.subscribers.get(target).size).toBe(2)

    observer.unsubscribe(target, child)
    observer.unsubscribe(target, attributes)

    expect(observer.subscribers.has(target)).toBe(false)
    expect(observer.subscribers.size).toBe(0)
  })
})

describe('ObjectObserver', () => {
  const manager = new ObserverManager()
  const observer = manager.object()

  const any = vi.fn((mutation) => expect(mutation.type).toBeOneOf(['get', 'set', 'del']))
  const get = vi.fn((mutation) => expect(mutation.type).toBe('get'))
  const set = vi.fn((mutation) => expect(mutation.type).toBe('set'))
  const del = vi.fn((mutation) => expect(mutation.type).toBe('del'))

  const target = {}
  const proxy = observer.observe(target)

  test('subscribe', () => {
    observer.subscribe(target, any)
    observer.subscribe(target, get, { get: true })
    observer.subscribe(target, set, { set: true })
    observer.subscribe(target, del, { del: true })

    expect(observer.subscribers.has(target)).toBe(true)
    expect(observer.subscribers.get(target).size).toBe(4)
  })

  test('notify', () => {
    proxy.foo = 'bar'
    proxy.baz = 'qux'

    delete proxy.foo

    proxy.baz

    expect(any).toHaveBeenCalledTimes(4)
    expect(get).toHaveBeenCalledTimes(1)
    expect(set).toHaveBeenCalledTimes(2)
    expect(del).toHaveBeenCalledTimes(1)
  })

  test('unsubscribe', () => {
    observer.unsubscribe(target, any)

    expect(observer.subscribers.get(target).get(any)).toBeUndefined()
    expect(observer.subscribers.get(target).size).toBe(3)

    observer.unsubscribe(target, get)
    observer.unsubscribe(target, set)
    observer.unsubscribe(target, del)

    expect(observer.subscribers.has(target)).toBe(false)
    expect(observer.subscribers.size).toBe(0)
  })
})