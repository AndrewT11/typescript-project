import Component from "./base-component";
import * as Validation from '../utils/validator';
import { autobind as Autobind} from "../decorators/autobind";
import { projectState } from "../state/project-state"; 



    // Project Input Class. Renders form and gathers user inputs
export default class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;
  
    constructor() {
      super("project-input", "app", true, "user-input");
      this.titleInputElement = this.element.querySelector(
        "#title"
      ) as HTMLInputElement;
      this.descriptionInputElement = this.element.querySelector(
        "#description"
      ) as HTMLInputElement;
      this.peopleInputElement = this.element.querySelector(
        "#people"
      ) as HTMLInputElement;
  
      this.configure(); // eventListener that triggers submitHandler(event)
    }
  
    configure() {
      this.element.addEventListener("submit", this.submitHandler);
    }
  
    renderContent() {}
  
    // gather user inputs and validate them. code for validation imported through reference above
    private gatherUserInput(): [string, string, number] | void {
      const enteredTitle = this.titleInputElement.value;
      const enteredDescription = this.descriptionInputElement.value;
      const enteredPeople = this.peopleInputElement.value;
  
      // functional validate on line 69
      const titleValidatable: Validation.Validatable = {
        value: enteredTitle,
        required: true,
        // minLength: 5,
      };
      const descriptionValidatable: Validation.Validatable = {
        value: enteredDescription,
        required: true,
        minLength: 5,
      };
      const peopleValidatable: Validation.Validatable = {
        value: +enteredPeople,
        required: true,
        min: 1,
        max: 5,
      };
  
      //   if(
      //     !validate(titleValidatable) ||
      //     !validate(descriptionValidatable) ||
      //     !validate(peopleValidatable)
      //   ) {
      //     alert("Invalid Inputs. Try again")
      //     return;
      //   } else {
      //     return [enteredTitle, enteredDescription, +enteredPeople]
      //   }
      if (
        Validation.validate(titleValidatable) &&
        Validation.validate(descriptionValidatable) &&
        Validation.validate(peopleValidatable)
      ) {
        return [enteredTitle, enteredDescription, +enteredPeople];
      } else {
        alert("Invalid Inputs. Try again");
        return;
      }
    }
  
    // autobind to be placed here. These will render HTML onto browser upon instantiation.
    @Autobind
    private submitHandler(event: Event) {
      event.preventDefault();
      const userInput = this.gatherUserInput(); // this returns information array of project [title, description, people] line 164.
      // checks to make sure if userInput is the tuple array we created with title, description and people information.
      if (Array.isArray(userInput)) {
        const [title, description, people] = userInput;
        projectState.addProject(title, description, people); //projectState is an instance of class ProjectState, created by using getInstance method() on line 33. We can now use that instance to add the project and have the state managed.
        this.clearInput();
      }
    }
  
    private clearInput() {
      this.titleInputElement.value = "";
      this.descriptionInputElement.value = "";
      this.peopleInputElement.value = "";
    }
}
