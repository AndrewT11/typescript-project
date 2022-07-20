import {Project, ProjectStatus } from '../models/project.js';
    
    
    // Project State Management
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = []; // list of listener functions that should be called when something changes. The idea is when something changes, like adding a new project, we call all listener functions addListener() method below.

  // get listener function and add it to listeners array
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

export class ProjectState extends State<Project> {
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

export const projectState = ProjectState.getInstance(); // instead of outright creating a new instance, we create a ne instance using ProjectState class method getInstance(). (Return our instance if we have one, or create a new one if we do not have one)
// We are guranteed to work with the exact same object and will always only have one object of the type in the entire application. We only want to have one state management object for our project, this project state with the singleton constructor.
