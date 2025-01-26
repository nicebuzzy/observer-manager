# Observer Manager

## Overview

A simple observer manager that currently supports Mutation and Object observers.

---

## Installation

### Node

```bash
npm install @nicebuzzy/observer-manager
```

### Browser

```js
import { ObserverManager } from 'https://esm.run/@nicebuzzy/observer-manager'
```

---

## Usage

```js
const manager = new ObserverManager()
```

### Mutation Observer

```js
const observer = manager.mutation()
const target = document.body

const any = (mutation) => console.log(mutation)
const attributes = (mutation) => console.log(mutation)

observer.subscribe(target, any, { childList: true, attributes: true })
observer.subscribe(target, attributes, { attributes: true })

target.appendChild(document.createElement('foo')) // calls any
target.setAttribute('foo', 'bar') // calls attributes, any

observer.unsubscribe(target, any)

target.appendChild(document.createElement('bar')) // calls nothing because any is unsubscribed
```

### Object Observer

```js
const observer = manager.object()
const target = {}

const any = (mutation) => console.log(mutation)
const set = (mutation) => console.log(mutation)

observer.subscribe(target, any, { get: true, set: true, del: true })
observer.subscribe(target, set, { set: true })

const proxy = observer.observe(target)

proxy.foo = 'bar' // calls set, any
const { foo } = proxy // calls any
delete proxy.foo // calls any

observer.unsubscribe(target, any)

const { baz } = proxy // calls nothing because any is unsubscribed
```

---

## API Reference

### Observer Manager

```js
import { ObserverManager } from '@nicebuzzy/observer-manager'

const manager = new ObserverManager()
```

#### `manager.mutation()`
`Returns`: `MutationObserverWrapper`

#### `manager.object()`

`Returns`: `ObjectObserverWrapper`

#### `manager.clear()`

Clears all observers but does not disconnect them.

#### `manager.disconnect(type)`

Disconnects a specific observer but does not remove it from the manager.

- `type`: `String`

#### `manager.list()`

`Returns`: `Object`

Returns a list of all active observers.

### Mutation Observer

```js
import { MutationObserverWrapper } from '@nicebuzzy/observer-manager'

const observer = new MutationObserverWrapper()
```

#### `observer.subscribe(target, subscriber, options)`

- `target`: `Node`
- `subscriber`: `Function`
- `options`: `Object`
    - `childList`: `Boolean`
    - `attributes`: `Boolean`
    - `subtree`: `Boolean`

    Refer to the [MDN](https://developer.mozilla.org/docs/Web/API/MutationObserver/observe) for details.

#### `observer.unsubscribe(target, subscriber)`

- `target`: `Node`
- `subscriber`: `Function`

### Object Observer

```js
import { ObjectObserverWrapper } from '@nicebuzzy/observer-manager'

const observer = new ObjectObserverWrapper()
```

#### `observer.subscribe(target, subscriber, options)`

- `target`: `Object`
- `subscriber`: `Function`
- `options`: `Object`
    - `get`: `Boolean`
    - `set`: `Boolean`
    - `del`: `Boolean`

#### `observer.unsubscribe(target, subscriber)`

- `target`: `Object`
- `subscriber`: `Function`

#### `observer.observe(target)`

`Returns`: `Proxy`

- `target`: `Object`

---

### Known Issues

- `MutationObserverWrapper` does not support the `attributeFilter` option when multiple subscribers are subscribed to the same target.
    - **Possible solutions:** Implement a custom filter in the callback or create a new instance of `MutationObserverWrapper`.

---