import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';
import { AppointmentsDayView } from './AppointmentsDayView';
import { CustomerForm } from './CustomerForm';
import { AppointmentForm } from './AppointmentForm';

import { sampleAppointments } from './sampleData';

ReactDOM.render(
  <AppointmentForm />,
  document.getElementById('root')
);