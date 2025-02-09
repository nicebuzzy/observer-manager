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
  const childList = vi.fn((mutation) => expect(mutation.type).toBe('childList'))
  const attributes = vi.fn((mutation) => expect(mutation.type).toBe('attributes'))

  const body = document.body
  const div = document.createElement('div')

  test('subscribe', async () => {
    observer.subscribe(body, any, { childList: true, attributes: true, subtree: true })
    observer.subscribe(body, childList, { childList: true })
    observer.subscribe(body, attributes, { attributes: true, subtree: false })

    observer.subscribe(div, any, { childList: true, attributes: true, subtree: false })
    observer.subscribe(div, childList, { childList: true, subtree: true })
    observer.subscribe(div, attributes, { attributes: true, subtree: true })

    expect(observer.targets.size).toBe(2)
    expect(observer.targets.has(body)).toBe(true)
    expect(observer.targets.has(div)).toBe(true)
    expect(observer.targets.get(body).size).toBe(3)
    expect(observer.targets.get(div).size).toBe(3)
  })

  test('notify', async () => {
    body.appendChild(div) // any (body) + childList
    body.setAttribute('foo', 'bar') // any (body) + attributes (body)

    div.appendChild(document.createElement('foo')) // any (body) + any (div) + childList (div)
    div.setAttribute('foo', 'bar') // any (body) + any (div) + attributes (div)

    div.querySelector('foo').appendChild(document.createElement('baz')) // any (body) + childList (div)
    div.querySelector('baz').setAttribute('baz', 'qux') // any (body) + attributes (div)

    await vi.waitFor(() => {
      expect(any).toHaveBeenCalledTimes(8)
      expect(childList).toHaveBeenCalledTimes(3)
      expect(attributes).toHaveBeenCalledTimes(3)
    })
  })

  test('unsubscribe', async () => {
    observer.unsubscribe(body, any)

    expect(observer.targets.get(body).get(any)).toBeUndefined()
    expect(observer.targets.get(body).size).toBe(2)

    observer.unsubscribe(body, childList)
    observer.unsubscribe(body, attributes)

    expect(observer.targets.has(body)).toBe(false)
    expect(observer.targets.size).toBe(1)

    observer.clear()
    expect(observer.targets.size).toBe(0)
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

    expect(observer.targets.has(target)).toBe(true)
    expect(observer.targets.get(target).size).toBe(4)
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

    expect(observer.targets.get(target).get(any)).toBeUndefined()
    expect(observer.targets.get(target).size).toBe(3)

    observer.unsubscribe(target, get)
    observer.unsubscribe(target, set)
    observer.unsubscribe(target, del)

    expect(observer.targets.has(target)).toBe(false)
    expect(observer.targets.size).toBe(0)
  })
})