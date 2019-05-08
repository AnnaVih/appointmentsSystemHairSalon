import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import { createContainer } from './domManipulators';
import { CustomerForm } from '../src/CustomerForm';

describe('CustomerForm', () => {
  let render, container;

  const form = id => container.querySelector(`form[id="${id}"]`);
  
  const expectToBeInputFieldOfTypeText = formElement => {
    expect(formElement).not.toBeNull();
    expect(formElement.tagName).toEqual('INPUT');
    expect(formElement.type).toEqual('text');
  };

  const field = name => form('customer').elements[name];

  const labelFor = formElement =>
  container.querySelector(`label[for="${formElement}"]`);

  const itRendersAsATextBox = (fieldName) =>
  it('renders as a text box', () => {
    render(<CustomerForm />);
    expectToBeInputFieldOfTypeText(field(fieldName));
  });

  const itIncludesTheExistingValue = (fieldName) =>
  it('includes the existing value', () => {
    render(<CustomerForm { ...{[fieldName]: 'value'} } />);
    expect(field(fieldName).value).toEqual('value');
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
    expect(field(fieldName).id).toEqual(fieldValue);
  });

  const savesExistingValueWhenSubmitted = (fieldName, value) =>
  it('saves existing value when submitted', async () => {
    expect.hasAssertions();
    render(
      <CustomerForm
        {...{[fieldName]: value}}
        onSubmit={ props =>
          expect(props[fieldName]).toEqual(value)
        }
      />
    );
    await ReactTestUtils.Simulate.submit(form('customer'));
  });

  const itSubmitsNewValue = (fieldName, value) =>
  it('saves new value when submitted', async () => {
    expect.hasAssertions();
    render(
      <CustomerForm
        { ...{[fieldName]: 'existingValue'} }
        onSubmit={props =>
          expect(props[fieldName]).toEqual(value)
        }
      />);
    await ReactTestUtils.Simulate.change(field(fieldName), {
      target: { value, name: fieldName }
    });
    await ReactTestUtils.Simulate.submit(form('customer'));
  });

  beforeEach(() => {
    ({ render, container } = createContainer());
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
    const submitButton = container.querySelector(
      'input[type="submit"]'
    );
    expect(submitButton).not.toBeNull();
  });

})