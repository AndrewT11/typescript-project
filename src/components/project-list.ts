import { projectState } from "../state/project-state.js";
import Component from "./base-component.js";
import { autobind } from "../decorators/autobind.js";
import { DragTarget } from "../models/drag-drop.js";
import { Project, ProjectStatus } from "../models/project.js";
import { ProjectItem } from "./project-item.js";


    // ProjectList Class. Will render all projects onto a list
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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