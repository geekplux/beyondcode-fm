import 'focus-visible'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { normalizePathname } from './lib/locale'
import { Root } from './Root'
import './index.css'

const el = document.getElementById('root')!
const app = (
  <BrowserRouter>
    <Root />
  </BrowserRouter>
)

// Hydrate only when the SSR shell was generated for this path (data-path).
const ssrPath = el.getAttribute('data-path')
const currentPath = normalizePathname(window.location.pathname)

if (ssrPath && normalizePathname(ssrPath) === currentPath && el.hasChildNodes()) {
  hydrateRoot(el, app)
} else {
  createRoot(el).render(app)
}
