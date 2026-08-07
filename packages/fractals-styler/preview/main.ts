import '../templates/_tokens.sass';
import '../templates/_typography.sass';
import '../templates/_globals.sass';
import '../templates/_primitives.sass';
import '../templates/_buttonslinks.sass';
import App from './App.svelte';
import { mount } from 'svelte';

const app = mount(App, { target: document.getElementById('app')! });

export default app;
