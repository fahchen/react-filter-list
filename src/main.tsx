import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Theme } from '@radix-ui/themes'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Theme className='w-full max-w-screen-lg mx-auto p-6'>
      <App />
    </Theme>
  </React.StrictMode>,
)
