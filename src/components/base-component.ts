// Component Base Class
// Abstract added before class Component so it may not be instantiated
// Component class is used for rendering things on the screen, h  ence templateElement, hostElement and element
export default abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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