// With this project, I need to render HTML from template, then take information input from input fields, validates the information. listens to click of submit button, then creates a new project (JS object stored in some array) where the array is rendered to the list (li and ul templates) and the entire list is added to the DOM (id="app"). 
// The reason we have an <template> with li and a <template> with ul is that we are creating a drag and drop list. So the li elements are going to be the drag elements, and we will be dropping into the <ul> list.
 
class ProjectState {
  private  listeners: any[] = [];
  private projects: any[] = [];
  private static instance: ProjectState;

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    } 
    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(listenerFn: Function) {
    this.listeners.push(listenerFn);
  }

  addProject(title: string, description: string, people: number) {
    const newProject = {
      id: Math.random().toString(),
      title: title,
      description: description,
      people: people,
    };
    this.projects.push(newProject); //pushing our new constructed project object into our projects array
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice()); // using slice will return a new copy of the array. listenerFn is a function we have not used yet.
    }
  }
}

// const newProject = new ProjectState(); // we are instantiating ProjectState so we may have a global constant.

const projectState = ProjectState.getInstance(); // instead of outright creating a new instance, we create a ne instance using ProjectState class method getInstance(). (Return our instance if we have one, or create a new one if we do not have one)

// Binding decorator for this in submit handler and binding in general
function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalDescriptor = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: true,
        get() {
            const boundFn = originalDescriptor.bind(this)
            return boundFn;
        }
    }
    return adjDescriptor;

}

// Validation
// remember, interface is just to set a template of what a validatable type is.The validator function will need to have the same properties as it is typed to Validatable. Value will always be required. The other keys are optional, thus have (?).
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

// will return true or false. In the function, we define isValid as true. Then, in the validation statements (if statements), we place if property as argument, then isValid will be true if isValid is true AND the statement behind is true. If not, it returns false to whatever we try to validate below.
// many of the if statements include arguments that will say if this isn't null (!= null) && then the property check given by interface Validatable.
function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (validatableInput.min != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (validatableInput.max != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }

  return isValid;
}

// ProjectList Class. Will render all projects onto a list
class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: any[];

    constructor(private type: "active" | 'finished') {
        this.templateElement = document.getElementById("project-list")! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;
        this.assignedProjects = [];


        const importedNode = document.importNode(this.templateElement.content, true); // pass a pointer at template element content. second argument is should this be a deep clone or not. If true, all levels of nesting inside of the template will come along. 

        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`;

        projectState.addListener((projects: any[]) => {
          this.assignedProjects = projects; // overriding assigned projects with new projects
          this.renderProjects();
        });
        this.attach();
        this.renderContent();
    }

    private renderProjects() {
      const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
      for (const item of this.assignedProjects) {
        const listItem = document.createElement("li");
        listItem.textContent = item.title
        listEl.appendChild(listItem)
      }
    }

    private renderContent () {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + `PROJECTS`;
    }

    private attach() {
      // this.element holds importedNode, which is the content of the template we want to insert. We are attaching all the template content of project list into hostElement, which is the pointer towards the app div that we will be rendering all the info. (basically <div id="root")
        this.hostElement.insertAdjacentElement('beforeend', this.element); //insertedAdjacentElement(<where to render>, <what to render>) 
    }
}


// Project Input Class. Renders form and gathers user inputs
class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement; //can also be HTMLElement. But since we know that it is a div, we add the specificity anyways.
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        this.templateElement = document.getElementById("project-input")! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true); // pass a pointer at template element content. second argument is should this be a deep clone or not. If true, all levels of nesting inside of the template will come along. 

        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = "user-input";

        this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;

        this.configure();   
        this.attach();
    }

    private gatherUserInput(): [string, string, number] | void {
      const enteredTitle = this.titleInputElement.value;
      const enteredDescription = this.descriptionInputElement.value;
      const enteredPeople = this.peopleInputElement.value;    

      const titleValidatable: Validatable = {
        value: enteredTitle,
        required: true,
        // minLength: 5,
      }
      const descriptionValidatable: Validatable = {
        value: enteredDescription,
        required: true,
        minLength: 5,
      }
      const peopleValidatable: Validatable = {
        value: +enteredPeople,
        required: true,
        min: 1,
        max: 5
      }

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
    if(
        validate(titleValidatable) &&
        validate(descriptionValidatable) &&
        validate(peopleValidatable)
      ) {
        return [enteredTitle, enteredDescription, +enteredPeople]
      } else {
        alert("Invalid Inputs. Try again")
        return;
      }
    };

    // autobind to be placed here. These will render HTML onto browser upon instantiation. 
    @Autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput(); // this returns information array of project [title, description, people] line 148.
        if (Array.isArray(userInput) ){
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people); //neProject is an instance of ProjectState, created by using getInstance method() on line 33.
            this.clearInput();
        }
    }

    private clearInput() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }


    private configure() {
        this.element.addEventListener('submit', this.submitHandler)
    }

    private attach() {
      this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}   

const proj1 = new ProjectInput();
const activeProjList = new ProjectList('active');
const finishedProjList = new ProjectList('finished');