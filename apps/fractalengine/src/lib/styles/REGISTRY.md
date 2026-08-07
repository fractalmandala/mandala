# Registry of Components and Classes

## Buttons

`btn-icon` - blank button to contain an icon svg or img file.  Svg file inside this button:
```
svg
	transition: all 90ms cubic-bezier(0.550, 0.085, 0.680, 0.530)
	transform-origin: center center
&:hover
	svg
		transform: scale(1.1)
```

`btn-icon-text`  - a flex row button to contain icon and text
`btn-text` - blank button that contains only text


```
.btn-sidebar-std
	border: none	
	background: transparent
	padding: var(--sz-8)
	display: flex
	justify-content: flex-start
	text-align: left