import React, { useState, useCallback } from 'react';

const toTimeValue = timestamp =>
  new Date(timestamp).toTimeString().substring(0, 5);

const timeIncrements = (numTimes, startTime, increment) =>
  Array(numTimes)
    .fill([startTime])
    .reduce((acc, _, i) =>
      acc.concat([startTime + (i * increment)]));

const dailyTimeSlots = (salonOpensAt, salonClosesAt) => {
  const totalSlots = (salonClosesAt - salonOpensAt) * 2;
  const startTime = new Date().setHours(salonOpensAt, 0, 0, 0);
  const increment = 30 * 60 * 1000;
  return timeIncrements(totalSlots,startTime, increment)
};

const weeklyDateValues = (startDate) => {
  const midnight = new Date(startDate).setHours(0, 0, 0, 0);
  const increment = 24 * 60 * 60 * 1000;
  return timeIncrements(7, midnight, increment)
};

const toShortDate = timestamp => {
  const [day, , dayOfMonth] = new Date(timestamp)
    .toDateString()
    .split(' ');
  return `${day} ${dayOfMonth}`;
};

const mergeDateAndTime = (date, timeSlot) => {
  const time = new Date(timeSlot);
  return new Date(date).setHours(
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
    time.getMilliseconds()
  );
};

const RadioButtonIfAvailable = ({
  availableTimeSlots,
  date,
  timeSlot,
  handleChange,
  checkedTimeSlot
}) => {
  const startsAt = mergeDateAndTime(date, timeSlot);
  if (availableTimeSlots.some(availableTimeSlot =>
      availableTimeSlot.startsAt === startsAt)) {
    const isChecked = startsAt === checkedTimeSlot;
    return (
      <input
        name="startsAt"
        type="radio"
        value={startsAt}
        checked={isChecked}
        onChange={handleChange}
      />
    )
  }

  return null;
};

const TimeSlotTable = ({
  salonOpensAt,
  salonClosesAt,
  today,
  availableTimeSlots,
  checkedTimeSlot,
  handleChange
}) => {
  const dates = weeklyDateValues(today);
  const timeSlots = dailyTimeSlots(
    salonOpensAt,
    salonClosesAt);
  return (
    <table id="time-slots">
    <thead>
      <tr>
        <th />
        {dates.map(d => (
          <th key={d}>{toShortDate(d)}</th>
        ))}
      </tr>
    </thead>
    <tbody>
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot}>
                <th>{toTimeValue(timeSlot)}</th>
                {dates.map(date =>
                <td key={date}>
                  <RadioButtonIfAvailable
                    availableTimeSlots={availableTimeSlots}
                    date={date}
                    timeSlot={timeSlot}
                    checkedTimeSlot={checkedTimeSlot}
                    handleChange={handleChange}
                  />
                </td>)}
              </tr>
            ))}
    </tbody>
    </table>
  );
};

export const AppointmentForm = ({
  selectableServices,
  service,
  onSubmit,
  salonOpensAt,
  salonClosesAt,
  today,
  availableTimeSlots
}) => {
  const [ selectedService, selectService ] = useState({ service });

  const handleStartsAtChange = useCallback(
    ({ target: { value } }) =>
    selectService(selectedService => ({
        ...selectedService,
        startsAt: parseInt(value)
      })),
    []
  );

  const handleChange = ({ target }) =>
  selectService(selectedService => ({
    ...selectedService,
    [target.name]: target.value
  }));

  const handleSubmit = async e => {
    e.preventDefault();
    const result = await window.fetch('/appointment', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedService)
    });
    if (result.ok) {
      onSubmit()
    } else {
      setError(true);
    }
  };

  return (
    <form id="appointment" onSubmit={handleSubmit}>
      <label htmlFor="service">Services</label>
      <select
        name="service"
        value={service}
        id="service"
        onChange={handleChange}
      >
        <option />
        {selectableServices.map(s => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <TimeSlotTable
        salonOpensAt={salonOpensAt}
        salonClosesAt={salonClosesAt}
        today={today}
        availableTimeSlots={availableTimeSlots}
        checkedTimeSlot={selectedService.startsAt}
        handleChange={handleStartsAtChange}
      />
    </form>
  )
}

AppointmentForm.defaultProps = {
  availableTimeSlots: [],
  today: new Date(),
  salonOpensAt: 9,
  salonClosesAt: 19,
  selectableServices: [
    'Cut',
    'Blow-dry',
    'Cut & color',
    'Beard trim',
    'Cut & beard trim',
    'Extensions']
};