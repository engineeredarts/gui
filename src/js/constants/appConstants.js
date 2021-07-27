module.exports = {
  SET_SNACKBAR: 'SET_SNACKBAR',
  RECEIVED_HOSTED_LINKS: 'RECEIVED_HOSTED_LINKS',
  SET_ANNOUNCEMENT: 'SET_ANNOUNCEMENT',
  SET_FIRST_LOGIN_AFTER_SIGNUP: 'SET_FIRST_LOGIN_AFTER_SIGNUP',
  UPLOAD_PROGRESS: 'UPLOAD_PROGRESS',
  PLANS: {
    os: {
      name: 'Basic',
      offer: true,
      price: '$29/month',
      deviceCount: 'for first 50 devices',
      offerprice: '$23/month for first 50 devices',
      price2: 'for first 6 months;\n$29/month thereafter',
      features: ['Basic OTA features'],
      value: 'os'
    },
    professional: {
      name: 'Professional',
      offer: true,
      price: '$249/month',
      deviceCount: 'for first 250 devices',
      offerprice: '$200/month for first 50 devices',
      price2: 'for first 6 months;\n$249/month thereafter',
      features: ['+ Advanced OTA features', '+ Standard support'],
      value: 'professional'
    },
    enterprise: {
      name: 'Enterprise',
      price: 'Custom pricing',
      deviceCount: 'unlimited devices',
      features: ['+ Enterprise-grade OTA features', '+ Premium support'],
      value: 'enterprise'
    }
  },
  // the needs names need to be aligned with the name of the features in the appReducer, as they will be checked in the addonselection
  ADDONS: {
    configure: {
      title: 'Configure',
      description: 'Expand your plan with device configuration features',
      needs: ['hasDeviceConfig'],
      os: {
        price: '$10/month',
        deviceCount: 'for first 50 devices'
      },
      professional: {
        price: '$60/month',
        deviceCount: 'for first 250 devices'
      }
    },
    troubleshoot: {
      title: 'Troubleshoot',
      description: 'Expand your plan with device troubleshooting features',
      needs: ['hasDeviceConnect'],
      os: {
        price: '$24/month',
        deviceCount: 'for first 50 devices'
      },
      professional: {
        price: '$67/month',
        deviceCount: 'for first 250 devices'
      }
    },
    monitor: {
      title: 'Monitor',
      description: 'Expand your plan with device monitoring features',
      needs: ['hasMonitor'],
      os: {
        price: '$24/month',
        deviceCount: 'for first 50 devices'
      },
      professional: {
        price: '$67/month',
        deviceCount: 'for first 250 devices'
      }
    }
  }
};
