import DeviceInfo from 'react-native-device-info';
import { AppIds, Config } from '../types';

const env: string = DeviceInfo.getBundleId();

const config: AppIds = {
  'com.hamagen.dev': {
    baseURL: '',
    dataUrl: 'https://matrixdemos.blob.core.windows.net/mabar/Points.json',
    stringsUrl: 'https://matrixdemos.blob.core.windows.net/mabar/texts.json',
    versionsUrl: 'https://matrixdemos.blob.core.windows.net/mabar/versions.json',
    sampleDistance: 50,
    sampleInterval: 1000 * 60 * 1, // 1 minutes
    fetchMilliseconds: 1000 * 60 * 15, // 15 minutes
    meterRadius: 500,
    intersectMilliseconds: 1, // 1 milli
    bufferUnits: 'meter',
    debug: false,
    sickMessage: {
      he: {
        title: 'יתכן כי זוהתה חשיפה אחת או יותר',
        body: 'יש ללחוץ כאן כדי לברר אם נחשפת'
      },
      en: {
        title: 'One or more exposures may have been detected',
        body: 'Click here to find out if you have been exposed'
      },
      am: {
        title: 'አንድ ወይም ከዚያ በላይ ተጋላጭነቶች ተከስተው ሊሆን ይችላል',
        body: 'የተጋለጡ መሆንዎን ለማወቅ እዚህ ጠቅ ያድርጉ'
      },
      ru: {
        title: 'Возможно, обнаружено одно или несколько совпадений',
        body: 'Нажмите здесь, чтобы узнать, если вы были выставлены'
      },
      ar: {
        title: 'ربما تم الكشف عن تداخل واحد أو أكثر',
        body: 'انقر هنا لمعرفة ما إذا كنت قد تعرضت'
      },
      duration: 10000
    },
    furtherInstructions: {
      he: 'https://govextra.gov.il/ministry-of-health/corona/corona-virus/',
      en: 'https://govextra.gov.il/ministry-of-health/corona/corona-virus-en/',
      am: 'https://govextra.gov.il/ministry-of-health/corona/corona-virus/',
      ru: 'https://govextra.gov.il/ministry-of-health/corona/corona-virus-ru',
      ar: 'https://govextra.gov.il/ministry-of-health/corona/corona-virus-ar/'
    },
    reportForm: {
      he: 'https://govforms.gov.il/mw/forms/QuarantineForExposees%40health.gov.il',
      en: 'https://govforms.gov.il/mw/forms/QuarantineForExposees%40health.gov.il',
      am: 'https://govforms.gov.il/mw/forms/QuarantineForExposees%40health.gov.il',
      ru: 'https://govforms.gov.il/mw/forms/QuarantineForExposees%40health.gov.il',
      ar: 'https://govforms.gov.il/mw/forms/QuarantineForExposees%40health.gov.il'
    }
  },
  'com.hamagen.qa': {
    baseURL: '',
    dataUrl: 'https://matrixdemos.blob.core.windows.net/mabar/Points.json',
    stringsUrl: 'https://matrixdemos.blob.core.windows.net/mabar/texts.json',
    versionsUrl: 'https://matrixdemos.blob.core.windows.net/mabar/versions.json',
    sampleDistance: 50,
    sampleInterval: 1000 * 60 * 1, // 1 minutes
    fetchMilliseconds: 1000 * 60 * 15, // 15 minutes
    meterRadius: 500,
    intersectMilliseconds: 1, // 1 milli
    bufferUnits: 'meter',
    debug: false,
    sickMessage: {
      he: {
        title: 'יתכן כי זוהתה חשיפה אחת או יותר',
        body: 'יש ללחוץ כאן כדי לברר אם נחשפת'
      },
      en: {
        title: 'One or more exposures may have been detected',
        body: 'Click here to find out if you have been exposed'
      },
      am: {
        title: 'አንድ ወይም ከዚያ በላይ ተጋላጭነቶች ተከስተው ሊሆን ይችላል',
        body: 'የተጋለጡ መሆንዎን ለማወቅ እዚህ ጠቅ ያድርጉ'
      },
      ru: {
        title: 'Возможно, обнаружено одно или несколько совпадений',
        body: 'Нажмите здесь, чтобы узнать, если вы были выставлены'
      },
      ar: {
        title: 'ربما تم الكشف عن تداخل واحد أو أكثر',
        body: 'انقر هنا لمعرفة ما إذا كنت قد تعرضت'
      },
      duration: 10000
    },
    furtherInstructions: {
      he: 'https://govextra.gov.il/ministry-of-health/corona/corona-virus/',
      en: 'https://govextra.gov.il/ministry-of-health/corona/corona-virus-en/',
      am: 'https://govextra.gov.il/ministry-of-health/corona/corona-virus/',
      ru: 'https://govextra.gov.il/ministry-of-health/corona/corona-virus-ru',
      ar: 'https://govextra.gov.il/ministry-of-health/corona/corona-virus-ar/'
    },
    reportForm: {
      he: 'https://govforms.gov.il/mw/forms/QuarantineForExposees%40health.gov.il',
      en: 'https://govforms.gov.il/mw/forms/QuarantineForExposees%40health.gov.il',
      am: 'https://govforms.gov.il/mw/forms/QuarantineForExposees%40health.gov.il',
      ru: 'https://govforms.gov.il/mw/forms/QuarantineForExposees%40health.gov.il',
      ar: 'https://govforms.gov.il/mw/forms/QuarantineForExposees%40health.gov.il'
    }
  },
  'com.hamagen': {
    baseURL: '',
    dataUrl: 'https://gisweb.azureedge.net/Points.json',
    stringsUrl: 'https://gisweb.azureedge.net/texts.json',
    versionsUrl: 'https://gisweb.azureedge.net/versions.json',
    sampleDistance: 50,
    sampleInterval: 1000 * 60 * 15,
    fetchMilliseconds: 1000 * 60 * 60, // One hour
    meterRadius: 500,
    intersectMilliseconds: 1, // 1 milli
    bufferUnits: 'meter',
    debug: false,
    sickMessage: {
      he: {
        title: 'יתכן כי זוהתה חשיפה אחת או יותר',
        body: 'יש ללחוץ כאן כדי לברר אם נחשפת'
      },
      en: {
        title: 'One or more exposures may have been detected',
        body: 'Click here to find out if you have been exposed'
      },
      am: {
        title: 'አንድ ወይም ከዚያ በላይ ተጋላጭነቶች ተከስተው ሊሆን ይችላል',
        body: 'የተጋለጡ መሆንዎን ለማወቅ እዚህ ጠቅ ያድርጉ'
      },
      ru: {
        title: 'Возможно, обнаружено одно или несколько совпадений',
        body: 'Нажмите здесь, чтобы узнать, если вы были выставлены'
      },
      ar: {
        title: 'ربما تم الكشف عن تداخل واحد أو أكثر',
        body: 'انقر هنا لمعرفة ما إذا كنت قد تعرضت'
      },
      duration: 10000
    },
    furtherInstructions: {
      he: 'https://govextra.gov.il/ministry-of-health/corona/corona-virus/',
      en: 'https://govextra.gov.il/ministry-of-health/corona/corona-virus-en',
      am: 'https://govextra.gov.il/ministry-of-health/corona/corona-virus-am',
      ru: 'https://govextra.gov.il/ministry-of-health/corona/corona-virus-ru',
      ar: 'https://govextra.gov.il/ministry-of-health/corona/corona-virus-ar'
    },
    reportForm: {
      he: 'https://govforms.gov.il/mw/forms/QuarantineForExposees%40health.gov.il',
      en: 'https://govforms.gov.il/mw/forms/QuarantineForExposees%40health.gov.il',
      am: 'https://govforms.gov.il/mw/forms/QuarantineForExposees%40health.gov.il',
      ru: 'https://govforms.gov.il/mw/forms/QuarantineForExposees%40health.gov.il',
      ar: 'https://govforms.gov.il/mw/forms/QuarantineForExposees%40health.gov.il'
    }
  }
};

const selectedConfig: Config = config[env] || config['com.hamagen'];

export default selectedConfig;
