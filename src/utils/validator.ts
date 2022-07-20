    // Validation
// remember, interface is just to set a template of what a validatable type is.The validator function will need to have the same properties as it is typed to Validatable. Value will always be required. The other keys are optional, thus have (?).
export interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  }
  
  // will return true or false. In the function, we define isValid as true. Then, in the validation statements (if statements), we place if property as argument, then isValid will be true if isValid is true AND the statement behind is true. If not, it returns false to whatever we try to validate below.
  // many of the if statements include arguments that will say if this isn't null (!= null) && then the property check given by interface Validatable.
export function validate(validatableInput: Validatable) {
    let isValid = true;
    if (validatableInput.required) {
      isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (
      validatableInput.minLength != null &&
      typeof validatableInput.value === "string"
    ) {
      isValid =
        isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (
      validatableInput.maxLength != null &&
      typeof validatableInput.value === "string"
    ) {
      isValid =
        isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (
      validatableInput.min != null &&
      typeof validatableInput.value === "number"
    ) {
      isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (
      validatableInput.max != null &&
      typeof validatableInput.value === "number"
    ) {
      isValid = isValid && validatableInput.value <= validatableInput.max;
    }
  
    return isValid;
  }