// MUI Imports
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'

// Util Imports
import { frontLayoutClasses } from '@layouts/utils/layoutClasses'

// Styles Imports
import styles from './styles.module.css'
import frontCommonStyles from '@views/front-pages/styles.module.css'
import { Container } from '@mui/material';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-darkGrey text-white py-12 pb-6 mt-16 bg-[url('/images/pages/why-choose-pattern-img.png'),_url('/images/pages/why-choose-pattern-img.png')] bg-no-repeat bg-[position:left_top,right_bottom] bg-[length:205,205px]">
        <section className='py-8'>
          <Container maxWidth='xl' sx={{ px: 4 }}>
            <div className='flex flex-wrap justify-center items-center gap-8 bg-bgLight -mt-36 py-6 rounded-sm'>
              {['Partner1', 'Partner2', 'Partner3', 'Partner4', 'Partner5', 'Partner6'].map((partner, index) => (
                <div key={index} className='grayscale hover:grayscale-0 transition-all duration-300'>
                  <Image
                    src={`/images/pages/logo1.png?height=40&width=120&text=${partner}`}
                    alt={partner}
                    width={157}
                    height={88}
                    className='object-contain'
                  />
                </div>
              ))}
            </div>
          </Container>
        </section>

        <div className='container mx-auto px-4'>
          <div className='flex flex-col md:flex-row items-center justify-between mb-6 pb-6 border-b border-red-100  '>
            <div className='w-full'>
              <h3 className='text-3xl font-light mb-2 text-white'>Newsletter</h3>
              <p className='text-sm text-white font-light'>Use this text to share the information which you like!</p>
            </div>
            <div className='mt-4 md:mt-0 flex w-full bg-white p-3 rounded-sm'>
              <TextField
                type='email'
                placeholder='Your email address'
                variant='outlined'
                className='w-full rounded-l-md text-black me-4'
                InputProps={{
                  sx: {
                    border: 'none',
                    boxShadow: 'none',
                    '& fieldset': {
                      border: 'none'
                    }
                  }
                }}
              />
              <Button size='small' className='bg-red-800 hover:bg-red-900 text-white rounded-l-none px-0 rounded'>
                <i className='ri-send-plane-line text-xl'></i>
              </Button>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
            <div>
              <Link href='/' className='text-xl font-bold mb-4 block'>
                <Image
                  src='/images/pages/logo-white.png'
                  alt='Luxury living room with tile flooring'
                  width={211}
                  height={21}
                  className='object-cover brightness-100'
                />
              </Link>
              <p className='text-sm text-gray-400'>
                Reference site about Lorem Ipsum, giving information on its origins, as well as a random Lipsum
                generator.
              </p>
            </div>
            <div>
              <h4 className='text-sm font-normal mb-4'>Information</h4>
              <ul className='space-y-2 text-sm text-gray-400  list-none p-0'>
                <li>
                  <Link href='/products' className='hover:text-white'>
                    Products
                  </Link>
                </li>
                <li>
                  <Link href='/faq' className='hover:text-white'>
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href='/about' className='hover:text-white'>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href='/privacy' className='hover:text-white'>
                    Privacy policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='text-sm font-normal mb-4'>Support</h4>
              <ul className='space-y-2 text-sm text-gray-400 list-none p-0'>
                <li>
                  <Link href='/contact' className='hover:text-white'>
                    Contact Us
                  </Link>
                </li>

                <li>
                  <Link href='/track' className='hover:text-white'>
                    Track Your Order
                  </Link>
                </li>
                <li>
                  <Link href='/help' className='hover:text-white'>
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href='/terms-of-use' className='hover:text-white'>
                    Terms Of Use
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='text-sm font-normal mb-4'>Contact Info</h4>
              <address className='text-sm text-gray-400 not-italic'>
                <div className='contact-div'>
                  {' '}
                  <h2 className='text-sm text-white mt-0 mb-2 font-normal'>Address </h2>
                  <p className='mt-0'>1222, 13 One arlington Avenue ,UK</p>
                </div>
                <div className='contact-div mt-3'>
                  <h2 className='text-sm text-white mt-0 mb-2 font-normal'>Phone</h2>
                  <p className='mt-2'>(123) 456-7890</p>
                </div>
                <div className='contact-div mt-3'>
                  <h2 className='text-sm text-white mt-0 mb-2 font-normal'>Email</h2>
                  <p className='mt-0'>info@eurotile.com</p>
                </div>
              </address>
            </div>
          </div>
          <div className='border-t border-gray-800 pt-6 text-sm text-gray-400 text-center'>
            <p className='mb-0'>© 2025-2026 EUROTILE. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
  )
}

export default Footer
