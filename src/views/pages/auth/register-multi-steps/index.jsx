'use client';

// React Imports
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";

// Next Imports
import Link from 'next/link';
import { useParams } from 'next/navigation';

// MUI Imports
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

// Third-party Imports
import classnames from 'classnames';

// Component Imports
import StepperWrapper from '@core/styles/stepper';
import StepAccountDetails from './StepAccountDetails';
import StepProfessionalInfo from './StepProfessionalInfo';
import StepperCustomDot from '@components/stepper-dot';
import Logo from '@components/layout/shared/Logo';

// Hook Imports
import { useSettings } from '@core/hooks/useSettings';

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n';
import { getCountries, getStatesByCountry } from '@/services/location';
import { toast } from 'react-toastify';

// Step Labels
const steps = [
  {
    title: 'Account',
    subtitle: 'Account Details'
  },
  {
    title: 'Professional',
    subtitle: 'Enter Information'
  }
];

// Main Component
const RegisterMultiSteps = () => {
  const [activeStep, setActiveStep] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    control,
    watch,
    getValues
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      confirmPassword: "",
      address: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        lat: '',
        long: '',
      },
      business: {
        name: "",
        email: "",
        phone: ""
      },
      businessDocument: {
        business_documents: null,
        registration_certificate: null,
        trade_license: null,
        proof_of_business: null
      }
    }
  });

  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  const { settings } = useSettings();
  const theme = useTheme();
  const { lang: locale } = useParams();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await getCountries();
        setCountryList(response?.data || []);
      } catch {
        toast.error('Failed to load countries');
      }
    };
    fetchCountries();
  }, []);

  const handleNext = async () => {
    const valid = await trigger();
    if (valid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep !== 0) setActiveStep((prev) => prev - 1);
  };

  const onSubmit = (data) => {
    console.log('Final submitted data:', data);
    // Send data to server here
  };

  const handleCountryChange = async (countryId) => {
    try {
      // Make API call to fetch states for the selected country
      const response = await getStatesByCountry(countryId);
      const data = await response.json();
      setStateList(data); // Update state list based on selected country
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const stepProps = {
    activeStep,
    handleNext,
    handlePrev,
    countryList,
    stateList,
    cityList,
    register,
    handleSubmit,
    errors,
    watch,
    control
  };

  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return <StepAccountDetails {...stepProps} handleSubmit={handleNext} onCountryChange={handleCountryChange} />;
      case 1:
        return <StepProfessionalInfo {...stepProps} handleSubmit={handleSubmit(onSubmit)} />;
      default:
        return null;
    }
  };

  return (
    <div className='flex bs-full justify-between items-center'>
      <div
        className={classnames('flex bs-full items-center justify-center is-[594px] max-md:hidden', {
          'border-ie': settings.skin === 'bordered'
        })}
      >
        <img
          src='/images/illustrations/characters/4.png'
          alt='multi-steps-character'
          className={classnames('mis-[92px] bs-auto max-bs-[628px] max-is-full', {
            'scale-x-[-1]': theme.direction === 'rtl'
          })}
        />
      </div>
      <div className='flex justify-center items-center bs-full is-full bg-backgroundPaper'>
        <Link
          href={getLocalizedUrl('/', locale)}
          className='absolute block-start-5 sm:block-start-[25px] inline-start-6 sm:inline-start-[25px]'
        >
          <Logo />
        </Link>
        <form onSubmit={handleSubmit(onSubmit)}>
          <StepperWrapper className='p-5 sm:p-8 is-[700px]'>
            <Stepper className='mbe-12 mbs-16 sm:mbs-0' activeStep={activeStep}>
              {steps.map((step, index) => (
                <Step key={index} onClick={() => setActiveStep(index)}>
                  <StepLabel
                    slots={{ stepIcon: StepperCustomDot }}
                  >
                    <div className='step-label cursor-pointer'>
                      <Typography className='step-number' color='text.primary'>{`0${index + 1}`}</Typography>
                      <div>
                        <Typography className='step-title' color='text.primary'>{step.title}</Typography>
                        <Typography className='step-subtitle' color='text.primary'>{step.subtitle}</Typography>
                      </div>
                    </div>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            {getStepContent()}
          </StepperWrapper>
        </form>
      </div>
    </div>
  );
};

export default RegisterMultiSteps;
