// With this project, I need to render HTML from template, then take information input from input fields, validates the information. listens to click of submit button, then creates a new project (JS object stored in some array) where the array is rendered to the list (li and ul templates) and the entire list is added to the DOM (id="app"). 
// The reason we have an <template> with li and a <template> with ul is that we are creating a drag and drop list. So the li elements are going to be the drag elements, and we will be dropping into the <ul> list.

function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: true,
        get() {
            const boundFn = originalMethod.bind(this)
            return boundFn;
        }
    }
    return adjDescriptor;

}

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

      if(enteredTitle.trim().length === 0 || enteredDescription.trim().length === 0 || enteredPeople.trim().length === 0) {
        alert("Invalid input. Please try again.")
        return;
      } else {
        return [enteredTitle, enteredDescription, +enteredPeople]
      }
    };

    // autobind to be placed here. These will render HTML onto browser upon instantiation. 
    @Autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput) ){
            const [title, description, people] = userInput;
            console.log(title, description, people)
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
        this.hostElement.insertAdjacentElement('afterbegin', this.element); //insertedAdjacentElement() 
    }
}   

const proj1 = new ProjectInput();