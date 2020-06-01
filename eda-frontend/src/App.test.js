import React from 'react'
import { render } from '@testing-library/react'
import Home from './pages/Home.js'

// eslint-disable-next-line
test('renders learn react link', () => {
  render(<Home />) // Tests if Home renders without errors
})
