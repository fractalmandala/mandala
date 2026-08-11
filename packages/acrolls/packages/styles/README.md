# @acrolls/styles

Scoped publishing CSS for Acrolls.

## Modes

```js
import '@acrolls/styles/foundation.css'; // mechanics only
import '@acrolls/styles/default.css';    // foundation + editorial scale
```

## Optional SASS tokens

```sass
@use '@acrolls/styles/sass/tokens' as *
@include acrolls-tokens()
```

Still load a CSS entry for mechanics, or compile your bridge onto `.acrolls`.

## Tokens

Set `--acrolls-*` (or host fallbacks like `--foreground`, `--accent`) on `.acrolls` or an ancestor.
