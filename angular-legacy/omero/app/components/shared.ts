export class WorkspaceUser {
  username: string;
  id: string;
}
export class Checks {
  link: any = undefined;
  rdmp: boolean = false;
  linkCreated: boolean = false;
  linkWithOther: boolean = false;
  master: boolean = false;
  comparing: boolean = false;

  clear() {
    this.linkCreated = false;
    this.linkWithOther = false;
  }
}

export class Creation {
  id: string;
  created: boolean = false;
  name: string = '';
  namespace: string;
  blank: boolean = true;
  template: any;
  description: string = '';
  group: any;
  validateMessage: string;
  location: string;

  clear() {
    this.location = '';
    this.description = '';
    this.name = '';
    this.id = '';
  }

  nameHasSpaces() {
    return /\s/g.test(this.name);
  }
}
export class CreationAlert {
  message: string = '';
  className: string = 'danger';
  status: string = '';

  set({message, status, className}) {
    this.message = message;
    this.status = status;
    this.className = className;
  }

  clear() {
    this.message = '';
    this.className = 'danger';
    this.status = '';
  }

}

export class CurrentWorkspace {
  path_with_namespace: string = '';
  web_url: string = '';
  location: string;
}
