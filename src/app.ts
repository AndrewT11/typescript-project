// type Listener
// class State
// class ProjectState
// function autobind
// interface validatable
// function validatable
// abstract class Component
// class ProjectList
// class ProjectInput

/// <reference path="drag-drop-interfaces.ts" />
/// <reference path="project-model.ts" />

namespace App {
// Project State Management
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = []; // list of listener functions that should be called when something changes. The idea is when something changes, like adding a new project, we call all listener functions addListener() method below.

  // get listener function and add it to listeners array
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  // private constructor to guarantee this is a singleton class
  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.Active
    );
    this.projects.push(newProject); //pushing our new constructed project object into our projects array
    this.updateListeners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find(prj => prj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice()); // using slice will return a new copy of the array. listenerFn is a function we have not used yet.
    }
  }
}

// const newProject = new ProjectState(); // we are instantiating ProjectState so we may have a global constant.

const projectState = ProjectState.getInstance(); // instead of outright creating a new instance, we create a ne instance using ProjectState class method getInstance(). (Return our instance if we have one, or create a new one if we do not have one)
// We are guranteed to work with the exact same object and will always only have one object of the type in the entire application. We only want to have one state management object for our project, this project state with the singleton constructor.

// Binding decorator for this in submit handler and binding in general
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalDescriptor = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: true,
    get() {
      const boundFn = originalDescriptor.bind(this);
      return boundFn;
    },
  };
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
// Component Base Class
// Abstract added before class Component so it may not be instantiated
// Component class is used for rendering things on the screen, hence templateElement, hostElement and element
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string | undefined
  ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    ); // pass a pointer at template element content. second argument is should this be a deep clone or not. If true, all levels of nesting inside of the template will come along.

    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }
    this.attach(insertAtStart);
  }
  private attach(insertAtStart: boolean) {
    // this.element holds importedNode, which is the content of the template we want to insert. We are attaching all the template content of project list into hostElement, which is the pointer towards the app div that we will be rendering all the info. (basically <div id="root")
    this.hostElement.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

// ProjectItem
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  private project: Project;

  get persons() {
    if(this.project.people === 1) {
      return '1 person';
    } else {
      return `${this.project.people} persons`;
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }
  @autobind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  };

  dragEndHandler(_: DragEvent) {
    console.log('DragEnd');
  };
 
  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("p")!.textContent = this.project.description;
    this.element.querySelector("h3")!.textContent =
      this.persons + ' assigned.'
  }
}

// ProjectList Class. Will render all projects onto a list
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

 

  // add background color when dragging over. Adds class droppable to ul
  @autobind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const listEl = this.element.querySelector('ul')!; 
      listEl.classList.add('droppable');
    }
   
  };

  @autobind
  dropHandler(event: DragEvent) {
    const projectId= event.dataTransfer!.getData('text/plain')
    projectState.moveProject(
      projectId,
      this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
    )
  };

  // remove background color when leaving item. Removes class droppable to ul

  @autobind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector('ul');
    listEl?.classList.remove('droppable')
  };

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects; // overriding assigned projects with new projects
      this.renderProjects();
    });
  } // added to correct class ProjectList error.
  // This is for making the list containers
  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + ` PROJECTS`;
  }

  // Render projects into the <ul> template above (id="project-list"); Take each project inside assignedProjects [] we created and make a list item out of it. We will display the project title as the textContent displayed in the li. Append the ListItem to the listEl, the box of active or finished products, based on the id type given to it.
  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = ""; //we were having a problem with double adding previous projects added to list. This will clear out the list, then rerender the list so that duplicates do not show.
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
    }
  }
}

// Project Input Class. Renders form and gathers user inputs
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

  // gather user inputs and validate them. code for validation above around line 69
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    // functional validate on line 69
    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
      // minLength: 5,
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validatable = {
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
      validate(titleValidatable) &&
      validate(descriptionValidatable) &&
      validate(peopleValidatable)
    ) {
      return [enteredTitle, enteredDescription, +enteredPeople];
    } else {
      alert("Invalid Inputs. Try again");
      return;
    }
  }

  // autobind to be placed here. These will render HTML onto browser upon instantiation.
  @autobind
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

new ProjectInput();
new ProjectList("active");
new ProjectList("finished");
}



