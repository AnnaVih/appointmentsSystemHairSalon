import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import 'whatwg-fetch';
import { fetchResponseOk, fetchResponseError, requestBodyOf } from './spyHelpers';
import { 
  createContainer,
  withEvent
} from './domManipulators';
import { CustomerForm } from '../src/CustomerForm';

describe('CustomerForm', () => {
  const expectToBeInputFieldOfTypeText = formElement => {
    expect(formElement).not.toBeNull();
    expect(formElement.tagName).toEqual('INPUT');
    expect(formElement.type).toEqual('text');
  };

  const itRendersAsATextBox = (fieldName) =>
  it('renders as a text box', () => {
    render(<CustomerForm />);
    expectToBeInputFieldOfTypeText(field('customer', fieldName));
  });

  const itIncludesTheExistingValue = (fieldName) =>
  it('includes the existing value', () => {
    render(<CustomerForm { ...{[fieldName]: 'value'} } />);
    expect(field('customer', fieldName).value).toEqual('value');
  });

  const itRendersAlabel = (fieldName, fieldValue) => 
  it('renders a label', ()=> {
    render(<CustomerForm />);
    expect(labelFor(fieldName)).not.toBeNull();
    expect(labelFor(fieldName).textContent).toEqual(fieldValue);
  });

  const itAssignsAnIdThatMatchesTheLabelId = (fieldName, fieldValue) =>
  it('assigns an id that matches the label id', () => {
    render(<CustomerForm />);
    expect(field('customer', fieldName).id).toEqual(fieldValue);
  });

  const savesExistingValueWhenSubmitted = (fieldName) =>
  it('saves existing value when submitted', async () => {
    render(
      <CustomerForm
        {...{[fieldName]: 'value'}}
      />);

      submit(form('customer'));

      expect(requestBodyOf(window.fetch)).toMatchObject({
        [fieldName]: 'value'
      });
  });

  const itSubmitsNewValue = (fieldName, value) =>
    it('saves new value when submitted', () => {
      render(
        <CustomerForm
          { ...{[fieldName]: 'existingValue'} }
        />
      );

      change(field('customer', fieldName), 
      withEvent(fieldName, value));

      submit(form('customer'));

      expect(requestBodyOf(window.fetch)).toMatchObject({
        [fieldName]: value
      });
  });

  let render, container, form, field, labelFor, element, change, submit;

  beforeEach(() => {
    ({ 
      render,
      container, 
      form, 
      field, 
      labelFor, 
      element,
      change,
      submit
    } = createContainer());

    jest
    .spyOn(window, 'fetch')
    .mockReturnValue(fetchResponseOk({}));
  });

  afterEach(() => {
    window.fetch.mockRestore();
  });

  it('renders a form', () => {
    render(<CustomerForm />);
    expect(form('customer')
    ).not.toBeNull();
  });


  describe('first name field', () => {
    itRendersAsATextBox('firstName');
    itIncludesTheExistingValue('firstName');
    itRendersAlabel('firstName', 'First name');
    itAssignsAnIdThatMatchesTheLabelId('firstName','firstName');
    savesExistingValueWhenSubmitted('firstName', 'Anna')
    itSubmitsNewValue('firstName', 'firstName');
  });

  describe('last name field', () => {
    itRendersAsATextBox('lastName');
    itIncludesTheExistingValue('lastName');
    itRendersAlabel('lastName', 'Last name');
    itAssignsAnIdThatMatchesTheLabelId('lastName','lastName');
    savesExistingValueWhenSubmitted('lastName', 'Vihrogonova')
    itSubmitsNewValue('lastName', 'lastName');
  });

  describe(' phone number field', () => {
    itRendersAsATextBox('phoneNumber');
    itIncludesTheExistingValue('phoneNumber');
    itRendersAlabel('phoneNumber', 'Phone number');
    itAssignsAnIdThatMatchesTheLabelId('phoneNumber','phoneNumber');
    savesExistingValueWhenSubmitted('phoneNumber', '1234567')
    itSubmitsNewValue('phoneNumber', 'phoneNumber');
  });

  it('has a submit button', () => {
    render(<CustomerForm />);
    const submitButton = element(
      'input[type="submit"]'
    );
    expect(submitButton).not.toBeNull();
  });

  it('calls fetch with the right properties when submitting data', async () => {
    render(
      <CustomerForm />
    );
    submit(form('customer'));
    expect(window.fetch).toHaveBeenCalledWith(
      '/customers',
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }
    }));
  });

  // it('notifies onSave when form is submitted', async() => {
  //   const customer = { id: 123 };
  //   window.fetch.mockReturnValue(fetchResponseOk(customer));
  //   const saveSpy = jest.fn();
  //   render(<CustomerForm onSave={saveSpy} />);
  //   await act(async () => { 
  //    submit(form('customer'));
  //   })
  //   expect(saveSpy).toHaveBeenCalledWith(customer);
  // });

  // it('does not notify onSave if the POST request returns an error', async () => {
  //   window.fetch.mockReturnValue(fetchResponseError());
  //   const saveSpy = jest.fn();
  //   render(<CustomerForm onSave={saveSpy} />);
  //   await act(async () => {
  //     submit(form('customer'));
  //   })
  //   expect(saveSpy).not.toHaveBeenCalled();
  // });

  // it('prevents the default action when submitting the form', async() => {
  //   const preventDefaultSpy = jest.fn();
  //   render(<CustomerForm />);
  //   await act(async () => {
  //     submit(form('customer'), {
  //       preventDefault: preventDefaultSpY
  //     });
  //   });
  //   expect(preventDefaultSpy).toHaveBeenCalled();
  // });

  // it('renders error message when fetch call fails', async () => {
  //   window.fetch.mockReturnValue(Promise.resolve({ ok: false }));
  //   render(<CustomerForm />);
  //   act(async () => {
  //     submit(form('customer'));
  //   });
  //   const errorElement = element('.error');
  //   expect(errorElement).not.toBeNull();
  //   expect(errorElement.textContent).toMatch('error occurred');
  // });
})