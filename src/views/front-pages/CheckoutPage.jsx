'use client'

// React Imports
import { useEffect } from 'react'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import Checkout from '@views/pages/wizard-examples/checkout/index'

// Styles Imports
import frontCommonStyles from './styles.module.css'

const CheckoutPage = () => {

  return (
    <section className={classnames('md:plb-[100px] plb-6', frontCommonStyles.layoutSpacing)}>
      <Checkout />
    </section>
  )
}

export default CheckoutPage
