import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MultiselectComponent } from './components/multiselect/multiselect.component';
import { ExamplesListComponent } from './components/examples-list/examples-list.component';
import { BackButtonComponent } from '../shared/layout/back-button/back-button.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CollapsibleComponent } from './components/collapsible/collapsible.component';

import { ExampleComponentsRoutingModule } from './example-components-routing.modules';
import { ExamplesRouterOutletComponent } from './components/examples-router-outlet/examples-router-outlet.component';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SidebarModule } from 'ng-sidebar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ExampleComponentsRoutingModule,
    NgMultiSelectDropDownModule,
    SidebarModule
  ],
  declarations: [
    ExamplesListComponent,
    MultiselectComponent,
    ExamplesRouterOutletComponent,
    BackButtonComponent,
    SidebarComponent,
    CollapsibleComponent
  ],
  exports: [BackButtonComponent]
})
export class ExampleComponentsModule {}
