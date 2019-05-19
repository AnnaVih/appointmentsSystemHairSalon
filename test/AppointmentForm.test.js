import React from 'react';
import 'whatwg-fetch';
import { fetchResponseOk, fetchResponseError, requestBodyOf } from './spyHelpers';
import { createContainer } from './domManipulators';
import { AppointmentForm } from '../src/AppointmentForm';

describe("AppointmentForm", () => {
  let render, container, form, field, labelFor, elements, timeSlotTable, submit, change;

  beforeEach(() => {
    ({
      render,   
      container, 
      form, 
      field, 
      timeSlotTable, 
      elements, 
      labelFor, 
      submit, 
      change 
    } = createContainer())

    jest
    .spyOn(window, 'fetch')
    .mockReturnValue(fetchResponseOk({}));
  })

  it('renders a form', () => {
    render(<AppointmentForm />);
    expect(form('appointment')).not.toBeNull();
  })

  describe('service field', () => {
    const startsAtField = index =>
      elements(`input[name="startsAt"]`)[
      index
    ];

    const findOption = (dropdownNode, textContent) => {
      const options = Array.from(dropdownNode.childNodes);
      return options.find(
        option => option.textContent === textContent
      );
    };

    it('renders as a select box', () => {
      render(<AppointmentForm />);
      expect(field('appointment', 'service')).not.toBeNull();
      expect(field('appointment', 'service').tagName).toEqual('SELECT');
    })

    it('initially has a blank value chosen', () => {
      render(<AppointmentForm/>);
      const firstNode = field('appointment', 'service').childNodes[0];
      expect(firstNode.value).toEqual('');
      expect(firstNode.selected).toBeTruthy();
    })

    it('lists all salon services', () => {
      const selectableServices = ['Cut', 'Blow-dry'];
      render(<AppointmentForm selectableServices={selectableServices}/>)
      const optionNodes = Array.from(field('appointment', 'service').childNodes);
      const renderedServices = optionNodes.map(
        node => node.textContent
      );
      expect(renderedServices).toEqual(
        expect.arrayContaining(selectableServices)
      );
    })

    it('pre-selects the existing value', () => {
      const services = ['Cut', 'Blow-dry'];
      render(
        <AppointmentForm
          selectableServices={services}
          service="Blow-dry"
        />
      );
      const option = findOption(
        field('appointment', 'service'),
        'Blow-dry'
      );
      expect(option.selected).toBeTruthy();
    });

    it('renders a label', () => {
      render(<AppointmentForm />);
      expect(labelFor("service")).not.toBeNull();
      expect(labelFor("service").textContent).toEqual("Services");
    });

    it('assigns an id that matches the label id', () => {
      render(<AppointmentForm />);
      expect(field('appointment', 'service').id).toEqual("service");
    });

    it('saves existing value when submitted', async () => {
      render(
        <AppointmentForm
          service="Blow-dr"
          onSubmit={ props =>
            expect(props["service"]).toEqual("Blow-dr")
          }
        />
      );
      submit(form('appointment'));
    });


    it('saves new value when submitted', async () => {
      render(
        <AppointmentForm
          service='existingValue'
          onSubmit={props =>
            expect(props["service"]).toEqual("Cut")
          }
        />
      );

      change(field('appointment', 'service'), {
        target: { value: "Cut", name: "service" }
      });
      submit(form('appointment'));
    });

    describe("time slot table", () => {
      it('renders a table for time slots', () => {
        render(<AppointmentForm />);
        expect(timeSlotTable('time-slots')).not.toBeNull();
      })
    })

    it('renders a time slot for every half an hour between open and close times', () => {
      render(<AppointmentForm salonOpensAt={9} salonClosesAt={11} />);
      const timesOfDay = timeSlotTable('time-slots').querySelectorAll('tbody > * th')
      expect(timesOfDay).toHaveLength(4);
      expect(timesOfDay[0].textContent).toEqual('09:00');
      expect(timesOfDay[1].textContent).toEqual('09:30');
      expect(timesOfDay[3].textContent).toEqual('10:30');
    })

    it('renders an empty cell at the start of the header row', () => {
      render(<AppointmentForm />);
      const headerRow = timeSlotTable('time-slots').querySelector(
        'thead > tr'
      );
      expect(headerRow.firstChild.textContent).toEqual('');
    });

    it('renders a week of available dates', () => {
      const today = new Date(2018, 11, 1);
      render(<AppointmentForm today={today} />);
      const dates = timeSlotTable('time-slots').querySelectorAll(
        'thead >* th:not(:first-child)'
      );
      expect(dates).toHaveLength(7);
      expect(dates[0].textContent).toEqual('Sat 01');
      expect(dates[1].textContent).toEqual('Sun 02');
      expect(dates[6].textContent).toEqual('Fri 07');
    });

    it('renders a radio button for each time slot', () => {
      const today = new Date();
      const availableTimeSlots = [
        { startsAt: today.setHours(9, 0, 0, 0) },
        { startsAt: today.setHours(9, 30, 0, 0) }
      ];
      render(
        <AppointmentForm
          availableTimeSlots={availableTimeSlots}
          today={today}
        />
      );
      const cells = timeSlotTable('time-slots').querySelectorAll('td');
      expect(
        cells[0].querySelector('input[type="radio"]')
      ).not.toBeNull();
      expect(
        cells[7].querySelector('input[type="radio"]')
      ).not.toBeNull();
    });

    it('does not render radio buttons for unavailable time slots', () => {
      render(<AppointmentForm availableTimeSlots={[]} />);
      const timesOfDay = timeSlotTable('time-slots').querySelectorAll(
        'input'
      );
      expect(timesOfDay).toHaveLength(0);
    });

    it('sets radio button values to the index of the corresponding appointment', () => {
      const today = new Date();
      const availableTimeSlots = [
        { startsAt: today.setHours(9, 0, 0, 0) },
        { startsAt: today.setHours(9, 30, 0, 0) }
      ];
      render(
        <AppointmentForm
          availableTimeSlots={availableTimeSlots}
          today={today}
        />);
      expect(startsAtField(0).value).toEqual(
        availableTimeSlots[0].startsAt.toString()
      );
      expect(startsAtField(1).value).toEqual(
        availableTimeSlots[1].startsAt.toString()
      );
    });
    
    it('saves new value when submitted', () => {
      const today = new Date();
      const availableTimeSlots = [
        { startsAt: today.setHours(9, 0, 0, 0) },
        { startsAt: today.setHours(9, 30, 0, 0) }
      ];
      render(
        <AppointmentForm
          availableTimeSlots={availableTimeSlots}
          today={today}
          startsAt={availableTimeSlots[0].startsAt}
          onSubmit={({ startsAt }) =>
            expect(startsAt).toEqual(availableTimeSlots[1].startsAt)
          }
        />
      );
      change(startsAtField(1), {
        target: {
          value: availableTimeSlots[1].startsAt.toString(),
          name: 'startsAt'
        }
      });
      submit(form('appointment'));
    });

    it('calls fetch with the right properties when submitting data', async () => {
      const today = new Date();
      const availableTimeSlots = [
          { startsAt: today.setHours(9, 0, 0, 0) },
          { startsAt: today.setHours(9, 30, 0, 0) }
      ];
      const submitSpy = jest.fn();

      render(
        <AppointmentForm
          onSubmit={submitSpy}
        />
      );

      submit(form('appointment'));
      expect(window.fetch).toHaveBeenCalledWith(
        '/appointment',
        expect.objectContaining({
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' }
      }));
    });
  });
})

