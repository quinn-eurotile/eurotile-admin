"use client"

// React Imports
import { SessionProvider } from "next-auth/react"

// Third-party Imports
import classnames from "classnames"

// Component Imports
import CheckoutWizard from "@/views/pages/wizard-examples/checkout/CheckoutWizard"

// Styles Imports
import frontCommonStyles from "./styles.module.css"


const CheckoutPage = ({ initialData, session }) => {

console.log(initialData,'initialData');

  return (
    <SessionProvider session={session}>
      <section className={classnames("md:plb-[100px] plb-6", frontCommonStyles.layoutSpacing)}>
        <CheckoutWizard initialData={initialData} />
      </section>
    </SessionProvider>
  )
}

export default CheckoutPage
