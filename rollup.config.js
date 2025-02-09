export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/observer-manager.js',
        format: 'es'
      },
      {
        file: 'dist/observer-manager.umd.js',
        format: 'umd',
        name: 'ObserverManager'
      }
    ]
  },
  {
    input: 'src/MutationObserverWrapper.js',
    output: [
      {
        file: 'dist/mutation-observer.js',
        format: 'es'
      },
      {
        file: 'dist/mutation-observer.umd.js',
        format: 'umd',
        name: 'ObserverManager'
      }
    ]
  },
  {
    input: 'src/ObjectObserverWrapper.js',
    output: [
      {
        file: 'dist/object-observer.js',
        format: 'es'
      },
      {
        file: 'dist/object-observer.umd.js',
        format: 'umd',
        name: 'ObserverManager'
      }
    ]
  }
]