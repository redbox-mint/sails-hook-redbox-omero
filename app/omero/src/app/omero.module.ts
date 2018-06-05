import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule} from "@angular/forms";
import { HttpModule } from '@angular/http';
import { OMEROFormComponent } from './omero-form.component';
import { OMEROService } from './omero.service';
import { WorkspaceFieldComponent } from './shared/form/workspace-field.component';
import { SharedModule } from './shared/shared.module';

import { LoginWorkspaceAppComponent } from './components/login-workspaceapp.component';
import { ListWorkspaceDataComponent } from './components/list-workspaces.component';
import { LinkModalWorkspaceComponent } from './components/linkmodal-workspace.component';
import { CreateWorkspaceComponent } from './components/create-workspace.component';

@NgModule({
  imports: [ BrowserModule, HttpModule, ReactiveFormsModule,
    SharedModule, FormsModule
  ],
  declarations: [ OMEROFormComponent, WorkspaceFieldComponent,
    ListWorkspaceDataComponent, LoginWorkspaceAppComponent,
    LinkModalWorkspaceComponent, CreateWorkspaceComponent
  ],
  exports: [ WorkspaceFieldComponent ],
  providers: [ OMEROService ],
  bootstrap: [ OMEROFormComponent ],
  entryComponents: [ WorkspaceFieldComponent, LoginWorkspaceAppComponent,
  ListWorkspaceDataComponent, LinkModalWorkspaceComponent,
  CreateWorkspaceComponent
 ]
})
export class OMEROModule { }
