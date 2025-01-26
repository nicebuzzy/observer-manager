const outputs = [
  ['index', 'ObserverManager'],
  ['MutationObserverWrapper', 'MutationObserverWrapper'],
  ['ObjectObserverWrapper', 'ObjectObserverWrapper']
].map(([file, name]) => {
  const outFile = file.toLowerCase()

  return {
    input: `src/${file}.js`,
    output: [
      {
        file: `dist/${outFile}.js`,
        format: 'es'
      },
      {
        file: `dist/${outFile}.umd.js`,
        format: 'umd',
        name: name
      }
    ]
  }
})

export default outputs